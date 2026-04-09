import { Controller, Get, Query, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TDengineService } from '@app/database/tdengine/tdengine.service';

@Controller('scada/overview')
export class OverviewController {
  
  constructor(
    private dataSource: DataSource,
    private tdengineService: TDengineService
  ) {}

  @Get('metrics')
  async getMetrics() {
    let activeAlarms = 0;
    try {
      const alarmRes = await this.dataSource.query(`SELECT COUNT(*) as count FROM alm_event WHERE status = 0`);
      activeAlarms = alarmRes[0]?.count || 0;
    } catch (e) {}

    // 尝试从 TDengine 获取今日供水和售水 (使用 device_raw 聚合，真实场景应使用 dma_5m/dma_daily)
    let dailySupply = 13900;
    let dailyLeakage = 2800;
    let nrwRate = 20.1;

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tsStr = todayStart.toISOString().replace('T', ' ').slice(0, 19);
      
      const sql = `SELECT SUM(raw_value) as supply FROM industry_ts.device_raw WHERE ts >= '${tsStr}' AND device_type = 1`;
      const tdRes = await this.tdengineService.query(sql);
      
      if (tdRes && tdRes.data && tdRes.data[0] && tdRes.data[0][0]) {
        dailySupply = parseFloat(tdRes.data[0][0].toFixed(2));
        dailyLeakage = parseFloat((dailySupply * 0.15).toFixed(2)); // 简单模拟漏损
        nrwRate = 15.0;
      }
    } catch (e) {
      // 如果没有连上 TDengine，静默回退到默认 mock
    }

    return {
      code: 200,
      data: { dailySupply, dailyLeakage, nrwRate, activeAlarms },
      message: 'success'
    };
  }

  @Get('trend')
  async getTrend() {
    let hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    let supplyValues = [310, 260, 620, 580, 500, 540, 360];
    let leakageValues = [22, 28, 48, 42, 38, 45, 30];

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tsStr = todayStart.toISOString().replace('T', ' ').slice(0, 19);

      // TDengine 降采样查询 (4小时级窗口)
      const sql = `SELECT _wstart, SUM(raw_value) FROM industry_ts.device_raw WHERE ts >= '${tsStr}' AND device_type = 1 INTERVAL(4h)`;
      const tdRes = await this.tdengineService.query(sql);
      
      if (tdRes && tdRes.data && tdRes.data.length > 0) {
        hours = [];
        supplyValues = [];
        leakageValues = [];
        for (const row of tdRes.data) {
          const t = new Date(row[0]);
          hours.push(`${t.getHours().toString().padStart(2, '0')}:00`);
          const val = parseFloat(row[1] || 0).toFixed(2);
          supplyValues.push(Number(val));
          leakageValues.push(Number((Number(val) * 0.15).toFixed(2))); // 模拟 15% 漏损
        }
      }
    } catch (e) {
      // 忽略 TDengine 连接失败
    }

    return {
      code: 200,
      data: { hours, supplyValues, leakageValues },
      message: 'success'
    };
  }

  @Get('water-quality')
  async getWaterQuality() {
    return {
      code: 200,
      data: { turbidity: 0.45, chlorine: 0.75, ph: 7.3, complianceRate: 99.8 },
      message: 'success'
    };
  }

  @Get('energy-trend')
  async getEnergyTrend(@Query('range') range: string) {
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
    try {
      const records = await this.dataSource.query(`
        SELECT id, created_at as time, alarm_level as level, alarm_desc as message 
        FROM alm_event 
        ORDER BY created_at DESC LIMIT 5
      `);
      
      if (records.length > 0) {
        return {
          code: 200,
          data: records.map(r => ({
            id: r.id,
            time: new Date(r.time).toLocaleTimeString(),
            level: r.level === 'HH' ? 'critical' : r.level === 'H' ? 'high' : 'medium',
            message: r.message
          })),
          message: 'success'
        };
      }
    } catch (e) {}

    return {
      code: 200,
      data: [
        { id: 1, time: new Date().toLocaleTimeString(), level: 'high', message: '[一厂区] 进水压力突降低于 0.15MPa' },
        { id: 2, time: new Date(Date.now() - 3600000).toLocaleTimeString(), level: 'critical', message: '[加药间] 硫化氢浓度超标联锁保护触发' }
      ],
      message: 'success'
    };
  }
}
