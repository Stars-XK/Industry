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
    // 临时模拟核心指标数据，未来应从 TDengine 中聚合查询
    return {
      dailySupply: 12450.5, // 供水量 m³
      dailyLeakage: 340.2,  // 漏水量 m³
      nrwRate: 12.5,        // 产销差率 %
      activeAlarms: 5       // 活跃报警数
    };
  }

  @Get('trend')
  @ApiOperation({ summary: '获取供水历史趋势' })
  async getTrend() {
    // 模拟返回最近 24 小时的供水趋势数据
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
