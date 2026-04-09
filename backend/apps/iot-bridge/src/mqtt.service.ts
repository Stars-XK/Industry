import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mqtt from 'mqtt';
import { IotTagMapping } from '../../../libs/entities/src/iot-tag-mapping.entity';
import { TDengineService } from '@app/database/tdengine/tdengine.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private tagMap: Map<string, IotTagMapping> = new Map();
  private readonly logger = new Logger(MqttService.name);

  constructor(
    @InjectRepository(IotTagMapping)
    private tagMappingRepo: Repository<IotTagMapping>,
    private tdengineService: TDengineService
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
        const tdengineSqls = [];

        for (const [tagName, rawValue] of Object.entries(msg.data)) {
          const mapping = this.tagMap.get(`${deviceId}_${tagName}`);
          if (mapping) {
            const parsedVal = parseFloat(rawValue as string);
            if (!isNaN(parsedVal)) {
              const scaledValue = parsedVal * mapping.scaling_factor;
              // TDengine 自动建子表逻辑 (子表名: dev_{deviceId}_{standard_name})
              const tableName = `dev_${deviceId}_${mapping.standard_name}`;
              tdengineSqls.push(`INSERT INTO ${tableName} USING device_raw TAGS ('${deviceId}', 'zone_1', 1) VALUES (${timestamp}, ${scaledValue});`);
            }
          }
        }

        if (tdengineSqls.length > 0) {
          // 纯 TDengine 写入，不再降级 MySQL！
          const batchSql = tdengineSqls.join(' ');
          await this.tdengineService.query(batchSql);
          this.logger.debug(`成功将 ${tdengineSqls.length} 条数据写入 TDengine`);
        }
      } catch (err) {
        this.logger.warn('解析 MQTT 或写入 TDengine 失败:', err.message);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT 连接错误:', err);
    });
  }
}
