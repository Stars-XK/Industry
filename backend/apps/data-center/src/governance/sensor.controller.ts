import { Controller, Get, Put, Body } from '@nestjs/common';

@Controller('governance/sensor')
export class SensorController {
  
  @Get('health')
  async getSensorHealthStatus() {
    // 真实业务逻辑:
    // 分析最近 24 小时内各个传感器的数据“死值率”、“缺失率”和“越限率”
    return {
      code: 200,
      data: [
        { deviceId: 'PUMP-01-FLOW', name: '1号出厂水流量计', onlineRate: '99.9%', effectiveRate: '98.5%', healthStatus: 'Normal' },
        { deviceId: 'VALVE-14-PRESS', name: '管网末端压力计(电池)', onlineRate: '85.2%', effectiveRate: '80.0%', healthStatus: 'Low_Battery_Warning' }
      ],
      message: 'success'
    };
  }

  @Put('config/filter')
  async updateFilterRule(@Body() body: { deviceType: string, maxSpike: number, zeroDrift: number }) {
    // 真实业务逻辑:
    // 配置清洗网关的过滤阈值（零点漂移容忍度、毛刺尖峰剔除值）
    // 存入 Redis 给 Python 清洗脚本实时订阅消费
    return {
      code: 200,
      data: body,
      message: `传感器类型 ${body.deviceType} 的清洗规则已更新`
    };
  }
}
