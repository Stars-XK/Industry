import { Controller, Get } from '@nestjs/common';

@Controller('governance/integration')
export class IntegrationController {
  
  @Get('status')
  async getChannelStatus() {
    // 真实业务逻辑:
    // 从 Prometheus 或 Gateway Metrics API 聚合各个外部协议通道的连通率、QPS、堆积消息等
    return {
      code: 200,
      data: {
        channels: [
          { protocol: 'MQTT', status: 'connected', currentQps: 15400, lag: 0, uptime: '42d 12h' },
          { protocol: 'OPC_UA', status: 'connected', currentQps: 3200, lag: 15, uptime: '14d 08h' },
          { protocol: 'Modbus_TCP', status: 'connected', currentQps: 540, lag: 0, uptime: '42d 12h' },
          { protocol: 'Kafka_ERP', status: 'warning', currentQps: 15, lag: 14200, uptime: '2d 01h' }
        ],
        totalDevices: 4520,
        activeTags: 154000
      },
      message: 'success'
    };
  }
}
