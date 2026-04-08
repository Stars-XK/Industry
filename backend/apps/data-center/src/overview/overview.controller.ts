import { Controller, Get, Query } from '@nestjs/common';

@Controller('scada/overview')
export class OverviewController {
  
  @Get('metrics')
  async getMetrics() {
    // 真实业务逻辑：
    // 1. 从 TDengine dma_daily 表查询供水、售水计算
    // 2. 从 alm_event 表 COUNT(*) 查询未恢复报警数
    return {
      code: 200,
      data: {
        dailySupply: 13900,
        dailyLeakage: 2800,
        nrwRate: 20.1,
        activeAlarms: 3
      },
      message: 'success'
    };
  }

  @Get('trend')
  async getTrend() {
    // 真实业务逻辑：
    // 从 TDengine dma_1h 聚合查询当天的趋势曲线
    return {
      code: 200,
      data: {
        hours: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        supplyValues: [310, 260, 620, 580, 500, 540, 360],
        leakageValues: [22, 28, 48, 42, 38, 45, 30]
      },
      message: 'success'
    };
  }

  @Get('water-quality')
  async getWaterQuality() {
    // 真实业务逻辑：
    // 查询 SCADA 系统中的水质仪表 Tag 实时快照
    return {
      code: 200,
      data: {
        turbidity: 0.45,
        chlorine: 0.75,
        ph: 7.3,
        complianceRate: 99.8
      },
      message: 'success'
    };
  }

  @Get('energy-trend')
  async getEnergyTrend(@Query('range') range: string) {
    // 真实业务逻辑：
    // 从 MySQL biz_energy_record 根据 range(7days/30days) 查询汇总
    return {
      code: 200,
      data: {
        dates: ['前7天', '前6天', '前5天', '前4天', '前3天', '前2天', '今日'],
        waterEnergy: [125, 130, 110, 140, 100, 220, 200],
        elecEnergy: [210, 190, 195, 240, 280, 320, 300],
        gasEnergy: [140, 220, 210, 160, 180, 310, 400]
      },
      message: 'success'
    };
  }

  @Get('alarms')
  async getActiveAlarms() {
    // 真实业务逻辑：
    // 查询 alm_event 关联 ast_device 表返回活跃告警
    return {
      code: 200,
      data: [
        { id: 1, time: new Date().toLocaleTimeString(), level: 'high', message: '[一厂区] 进水压力突降低于 0.15MPa' },
        { id: 2, time: new Date(Date.now() - 3600000).toLocaleTimeString(), level: 'critical', message: '[加药间] 硫化氢浓度超标联锁保护触发' },
        { id: 3, time: new Date(Date.now() - 7200000).toLocaleTimeString(), level: 'medium', message: '[二供泵房] 1号变频器通讯心跳中断' }
      ],
      message: 'success'
    };
  }
}
