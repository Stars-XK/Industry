import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as mqtt from 'mqtt';
import { IotTagMapping } from '../../../libs/entities/src/iot-tag-mapping.entity';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private tagMap: Map<string, IotTagMapping> = new Map();
  private readonly logger = new Logger(MqttService.name);

  constructor(
    @InjectRepository(IotTagMapping)
    private tagMappingRepo: Repository<IotTagMapping>,
    private dataSource: DataSource
  ) {}

  async onModuleInit() {
    await this.loadTagMappings();
    this.connectMqtt();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  // 加载测点映射配置 (每隔一段时间可以重新拉取)
  private async loadTagMappings() {
    const tags = await this.tagMappingRepo.find({ where: { is_active: 1 } });
    this.tagMap.clear();
    for (const tag of tags) {
      // 组装唯一键 key = device_id_tag_name
      this.tagMap.set(`${tag.device_id}_${tag.tag_name}`, tag);
    }
    this.logger.log(`已加载 ${tags.length} 条有效测点映射规则`);
  }

  private connectMqtt() {
    // 连接本地边缘网关脚本起的 Broker
    this.client = mqtt.connect('mqtt://localhost:1883', {
      clientId: 'iot_bridge_consumer_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log('已连接到 MQTT Broker, 开始订阅 telemetry/devices/+/data');
      this.client.subscribe('telemetry/devices/+/data', (err) => {
        if (err) this.logger.error('订阅失败', err);
      });
    });

    this.client.on('message', async (topic, payload) => {
      try {
        const msg = JSON.parse(payload.toString());
        // topic: telemetry/devices/{deviceId}/data
        const deviceIdStr = topic.split('/')[2];
        const deviceId = parseInt(deviceIdStr, 10);

        if (isNaN(deviceId) || !msg.data) return;

        const timestamp = msg.timestamp || Date.now();
        const recordsToInsert = [];

        // 遍历上报的数据字段
        for (const [tagName, rawValue] of Object.entries(msg.data)) {
          const mapping = this.tagMap.get(`${deviceId}_${tagName}`);
          if (mapping) {
            // 应用缩放因子进行数值清洗
            const parsedVal = parseFloat(rawValue as string);
            if (!isNaN(parsedVal)) {
              const scaledValue = parsedVal * mapping.scaling_factor;

              recordsToInsert.push({
                device_id: deviceId,
                tag_name: tagName,
                standard_name: mapping.standard_name,
                value: scaledValue,
                timestamp: timestamp
              });
            }
          }
        }

        // 批量写入到 MySQL (降级替代 TDengine)
        if (recordsToInsert.length > 0) {
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          try {
            // 直接执行原始 SQL 插入 device_raw 表
            const valuesStr = recordsToInsert.map(r => `(${r.device_id}, '${r.tag_name}', '${r.standard_name}', ${r.value}, ${r.timestamp})`).join(',');
            await queryRunner.query(`INSERT INTO device_raw (device_id, tag_name, standard_name, value, timestamp) VALUES ${valuesStr}`);
            this.logger.debug(`成功写入 ${recordsToInsert.length} 条设备清洗数据`);
          } catch (dbErr) {
            this.logger.error('写入数据库失败', dbErr);
          } finally {
            await queryRunner.release();
          }
        }
      } catch (err) {
        this.logger.warn('解析 MQTT 消息失败:', err.message);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT 连接错误:', err);
    });
  }
}
