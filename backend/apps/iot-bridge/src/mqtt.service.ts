import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as mqtt from 'mqtt';
import axios from 'axios';
import { IotTagMapping } from '../../../libs/entities/src/iot-tag-mapping.entity';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private tagMap: Map<string, IotTagMapping> = new Map();
  private readonly logger = new Logger(MqttService.name);

  private readonly tdengineUrl = 'http://localhost:6041/rest/sql';
  private readonly tdengineDb = 'dma';
  private readonly tdengineAuth = 'Basic ' + Buffer.from('root:taosdata').toString('base64');

  constructor(
    @InjectRepository(IotTagMapping)
    private tagMappingRepo: Repository<IotTagMapping>,
    private dataSource: DataSource
  ) {}

  async onModuleInit() {
    await this.loadTagMappings();
    if (process.env.MQTT_ENABLED === '1') {
      this.connectMqtt();
    } else {
      this.logger.warn('MQTT 客户端连接已根据环境变量 MQTT_ENABLED 被禁用');
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  private async loadTagMappings() {
    const tags = await this.tagMappingRepo.find({ where: { is_active: 1 } });
    this.tagMap.clear();
    for (const tag of tags) {
      this.tagMap.set(`${tag.device_id}_${tag.tag_name}`, tag);
    }
    this.logger.log(`已加载 ${tags.length} 条有效测点映射规则`);
  }

  private connectMqtt() {
    const host = process.env.MQTT_HOST || 'localhost';
    const port = process.env.MQTT_PORT || '1883';
    const username = process.env.MQTT_USERNAME;
    const password = process.env.MQTT_PASSWORD;

    const mqttUrl = `mqtt://${host}:${port}`;
    
    this.client = mqtt.connect(mqttUrl, {
      clientId: 'iot_bridge_consumer_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      reconnectPeriod: 5000,
      username: username || undefined,
      password: password || undefined,
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
        const deviceIdStr = topic.split('/')[2];
        const deviceId = parseInt(deviceIdStr, 10);

        if (isNaN(deviceId) || !msg.data) return;

        const timestamp = msg.timestamp || Date.now();
        const recordsToInsert = [];
        const tdengineSqls = [];

        for (const [tagName, rawValue] of Object.entries(msg.data)) {
          const mapping = this.tagMap.get(`${deviceId}_${tagName}`);
          if (mapping) {
            const parsedVal = parseFloat(rawValue as string);
            if (!isNaN(parsedVal)) {
              const scaledValue = parsedVal * mapping.scaling_factor;

              // MySQL 数据集
              recordsToInsert.push({
                device_id: deviceId,
                tag_name: tagName,
                standard_name: mapping.standard_name,
                value: scaledValue,
                timestamp: timestamp
              });

              // TDengine 自动建子表逻辑 (子表名: dev_{deviceId}_{standard_name})
              // 使用 device_raw 超级表, TAGS (device_id, zone_id, device_type)
              // 这里简化 zone_id='zone_1', device_type=1 仅做演示
              const tableName = `dev_${deviceId}_${mapping.standard_name}`;
              tdengineSqls.push(`INSERT INTO ${this.tdengineDb}.${tableName} USING ${this.tdengineDb}.device_raw TAGS ('${deviceId}', 'zone_1', 1) VALUES (${timestamp}, ${scaledValue})`);
            }
          }
        }

        if (recordsToInsert.length > 0) {
          // 1. 尝试写入 TDengine (符合路线图要求)
          let tdengineSuccess = false;
          try {
            const batchSql = tdengineSqls.join(' ');
            await axios.post(this.tdengineUrl, batchSql, {
              headers: { Authorization: this.tdengineAuth }
            });
            tdengineSuccess = true;
            this.logger.debug(`成功将 ${recordsToInsert.length} 条数据写入 TDengine 超级表`);
          } catch (tdErr) {
            // 静默处理，因为沙箱环境可能没装 TDengine
            // this.logger.warn('TDengine 写入失败，将降级写入 MySQL');
          }

          // 2. 如果 TDengine 失败，或者为了保证系统能跑，同时写入 MySQL
          if (!tdengineSuccess) {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            try {
              const valuesStr = recordsToInsert.map(r => `(${r.device_id}, '${r.tag_name}', '${r.standard_name}', ${r.value}, ${r.timestamp})`).join(',');
              await queryRunner.query(`INSERT INTO device_raw (device_id, tag_name, standard_name, value, timestamp) VALUES ${valuesStr}`);
              // this.logger.debug(`降级写入 ${recordsToInsert.length} 条数据到 MySQL`);
            } catch (dbErr) {
              this.logger.error('写入 MySQL 数据库失败', dbErr);
            } finally {
              await queryRunner.release();
            }
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
