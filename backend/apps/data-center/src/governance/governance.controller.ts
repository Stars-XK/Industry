import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('数据中台与治理底座')
@ApiBearerAuth()
@Controller('api/data-center/governance')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class GovernanceController {
  constructor(private dataSource: DataSource) {}

  @Get('interpolate/rules')
  @ApiOperation({ summary: '获取数据清洗与插值规则' })
  @RequirePermissions('gov:interpolate')
  async getInterpolateRules() {
    const query = `
      SELECT r.*, d.device_name 
      FROM biz_interpolate_rule r
      LEFT JOIN ast_device d ON r.device_id = d.id
      ORDER BY r.id DESC
    `;
    return await this.dataSource.query(query);
  }

  @Post('interpolate/recalculate')
  @ApiOperation({ summary: '执行历史数据重算(清洗与插值)' })
  @RequirePermissions('gov:interpolate')
  async executeRecalculate(@Body() body: { deviceId: number, tag: string, method: string, startTime: string, endTime: string }) {
    // 模拟工业级的高危历史重算任务流转
    return {
      success: true,
      message: `已提交异步重算任务。设备ID: ${body.deviceId}, 测点: ${body.tag}, 算法: ${body.method}, 时间段: ${body.startTime} 至 ${body.endTime}`,
      taskId: 'JOB-' + Date.now()
    };
  }
}
