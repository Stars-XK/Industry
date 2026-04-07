import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('全局态势感知')
@ApiBearerAuth()
@Controller('api/data-center/overview')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OverviewController {
  constructor(private dataSource: DataSource) {}

  @Get('metrics')
  @ApiOperation({ summary: '获取核心指标统计' })
  async getMetrics() {
    // 从 device_raw 获取真实采集数据（此处降级为 MySQL 查询）
    let dailySupply = 12450.5;
    
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const query = `
        SELECT SUM(value) as total 
        FROM device_raw 
        WHERE standard_name = 'flow_rate' AND timestamp >= ?
      `;
      const res = await this.dataSource.query(query, [todayStart.getTime()]);
      if (res && res[0] && res[0].total) {
        // 由于 flow_rate 是瞬时流量(m3/h)，上报频率是2s，需简单折算为累计量。
        // 这里只是为了演示看板有真实数据跳动
        dailySupply = parseFloat((res[0].total / 1800).toFixed(1)); 
      }
    } catch (e) {
      console.error('查询核心指标失败', e);
    }

    return {
      dailySupply: dailySupply, 
      dailyLeakage: parseFloat((dailySupply * 0.12).toFixed(1)), // 模拟漏水量 12%
      nrwRate: 12.0,        // 产销差率 %
      activeAlarms: 0       // 活跃报警数
    };
  }

  @Get('trend')
  @ApiOperation({ summary: '获取供水历史趋势' })
  async getTrend() {
    const hours = [];
    const supplyValues = [];
    const leakageValues = [];
    let base = 500;
    
    try {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const startTime = now.getTime() - 23 * 3600 * 1000;
      
      const query = `
        SELECT 
          FLOOR(timestamp / 3600000) * 3600000 as hour_ts,
          SUM(value) as total_flow
        FROM device_raw 
        WHERE standard_name = 'flow_rate' AND timestamp >= ?
        GROUP BY hour_ts
        ORDER BY hour_ts ASC
      `;
      const res = await this.dataSource.query(query, [startTime]);
      const flowMap = new Map();
      res.forEach(r => {
        // 由于 flow_rate 采样频次原因，简单换算为模拟量
        flowMap.set(parseInt(r.hour_ts), parseFloat((r.total_flow / 1800).toFixed(1)));
      });

      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600 * 1000);
        hours.push(`${d.getHours().toString().padStart(2, '0')}:00`);
        const ts = d.getTime();
        let val = flowMap.get(ts);
        if (!val) {
          const hourHash = d.getHours();
          val = Math.round(base + (hourHash * 17 % 100) - 50);
        }
        supplyValues.push(val);
        leakageValues.push(Math.round(val * 0.12));
      }
    } catch (e) {
      console.error('查询历史趋势失败', e);
      // Fallback
      for (let i = 23; i >= 0; i--) {
        const d = new Date(Date.now() - i * 3600 * 1000);
        hours.push(`${d.getHours().toString().padStart(2, '0')}:00`);
        const hourHash = d.getHours();
        const val = Math.round(base + (hourHash * 17 % 100) - 50);
        supplyValues.push(val);
        leakageValues.push(Math.round(val * 0.12));
      }
    }

    return { hours, supplyValues, leakageValues };
  }

  @Get('water-quality')
  @ApiOperation({ summary: '获取水质综合指标' })
  async getWaterQuality() {
    let turbidity = 0.5;
    let chlorine = 0.6;
    let ph = 7.2;

    try {
      const query = `
        SELECT standard_name, value 
        FROM device_raw 
        WHERE device_id = 3 AND standard_name IN ('turbidity', 'chlorine', 'ph')
        ORDER BY timestamp DESC
        LIMIT 3
      `;
      const res = await this.dataSource.query(query);
      res.forEach(r => {
        if (r.standard_name === 'turbidity') turbidity = r.value;
        if (r.standard_name === 'chlorine') chlorine = r.value;
        if (r.standard_name === 'ph') ph = r.value;
      });
    } catch (e) {
      console.error('获取水质数据失败', e);
    }

    return {
      turbidity: Number(turbidity.toFixed(2)),
      chlorine: Number(chlorine.toFixed(2)),
      ph: Number(ph.toFixed(2)),
      complianceRate: 99.8
    };
  }

  @Get('energy-trend')
  @ApiOperation({ summary: '获取能耗折标煤趋势' })
  async getEnergyTrend(@Query('range') range: string = '7days') {
    const daysCount = range === '7days' ? 7 : 30;
    const dates = [];
    const waterEnergy = [];
    const elecEnergy = [];
    const gasEnergy = [];

    // 使用确定性算法生成趋势，消除 Math.random 的不确定性
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400 * 1000);
      dates.push(`${d.getMonth() + 1}-${d.getDate()}`);
      
      const seed = d.getDate();
      waterEnergy.push(100 + (seed * 7 % 50));
      elecEnergy.push(200 + (seed * 11 % 100));
      gasEnergy.push(150 + (seed * 13 % 80));
    }

    return {
      dates,
      waterEnergy,
      elecEnergy,
      gasEnergy
    };
  }

  @Get('alarms')
  @ApiOperation({ summary: '获取最近活动报警' })
  async getAlarms() {
    try {
      const now = Date.now();
      const timeLimit = now - 24 * 3600 * 1000; // last 24h
      const query = `
        SELECT standard_name, value, timestamp 
        FROM device_raw 
        WHERE timestamp >= ? AND (
          (standard_name = 'pressure' AND value < 0.3) OR 
          (standard_name = 'h2s' AND value >= 10.0)
        )
        ORDER BY timestamp DESC
        LIMIT 5
      `;
      const res = await this.dataSource.query(query, [timeLimit]);
      if (res && res.length > 0) {
        return res.map(r => {
          const timeDiff = Math.floor((now - r.timestamp) / 60000);
          const timeStr = timeDiff < 60 ? `${timeDiff}分钟前` : `${Math.floor(timeDiff/60)}小时前`;
          
          if (r.standard_name === 'pressure') {
            return { content: `1号水厂出水压力过低 (${r.value.toFixed(2)} MPa)`, timestamp: timeStr, type: 'danger', size: 'large' };
          } else {
            return { content: `地下泵站 H₂S 浓度超标 (${r.value.toFixed(1)} ppm)`, timestamp: timeStr, type: 'danger', size: 'large' };
          }
        });
      }
    } catch (e) {
      console.error('获取报警数据失败', e);
    }
    
    // Default fallback if no real alarms or DB fails
    return [
      { content: '2号泵站2#泵变频器通讯中断', timestamp: '45分钟前', type: 'warning' },
      { content: '水质浊度传感器数值异常', timestamp: '3小时前', type: 'info' }
    ];
  }
}
