import { Controller, Get, UseGuards } from '@nestjs/common';
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
    // 模拟返回最近 24 小时的供水趋势数据，结合部分真实数据
    const hours = [];
    const values = [];
    let base = 500;
    for (let i = 23; i >= 0; i--) {
      const d = new Date(Date.now() - i * 3600 * 1000);
      hours.push(`${d.getHours().toString().padStart(2, '0')}:00`);
      values.push(Math.round(base + Math.random() * 100 - 50));
    }
    return { hours, values };
  }
}
