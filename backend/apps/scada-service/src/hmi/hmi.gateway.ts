import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as mqtt from 'mqtt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/scada'
})
export class HmiGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('HmiGateway');
  private mqttClient: mqtt.MqttClient;

  afterInit(server: Server) {
    this.logger.log('SCADA WebSocket Gateway 初始化成功');
    this.connectMqtt();
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`前端客户端已连接: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`前端客户端已断开: ${client.id}`);
  }

  private connectMqtt() {
    this.mqttClient = mqtt.connect('mqtt://localhost:1883', {
      clientId: 'scada_service_hmi_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      reconnectPeriod: 5000,
    });

    this.mqttClient.on('connect', () => {
      this.logger.log('已连接到 MQTT Broker, 开始订阅 telemetry/devices/+/data');
      this.mqttClient.subscribe('telemetry/devices/+/data');
    });

    this.mqttClient.on('message', (topic, payload) => {
      try {
        const msg = JSON.parse(payload.toString());
        // 将收到的 MQTT 消息直接广播给所有连接的 WebSocket 客户端
        this.server.emit('telemetry_update', {
          topic,
          data: msg
        });
      } catch (err) {
        this.logger.warn('解析 MQTT 消息失败', err.message);
      }
    });

    this.mqttClient.on('error', (err) => {
      this.logger.error('MQTT 连接错误:', err);
    });
  }

  // 提供给 Controller 调用的方法，用于下发指令
  publishCommand(deviceId: number, tag: string, value: any) {
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `command/devices/${deviceId}/set`;
      const payload = JSON.stringify({
        tag,
        value,
        timestamp: Date.now()
      });
      this.mqttClient.publish(topic, payload);
      this.logger.log(`已向 MQTT 发布反控指令: ${topic} -> ${payload}`);
      return true;
    }
    return false;
  }
}
