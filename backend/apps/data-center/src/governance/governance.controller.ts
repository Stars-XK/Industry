import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
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

  @Post('interpolate/rules')
  @ApiOperation({ summary: '新增清洗与插值规则' })
  @RequirePermissions('gov:interpolate')
  async createInterpolateRule(@Body() body: any) {
    const { device_id, tag_name, method, max_gap_minutes } = body;
    await this.dataSource.query(
      `INSERT INTO biz_interpolate_rule (device_id, tag_name, method, max_gap_minutes) VALUES (?, ?, ?, ?)`,
      [device_id, tag_name, method, max_gap_minutes]
    );
    return { success: true };
  }

  @Put('interpolate/rules/:id')
  @ApiOperation({ summary: '修改清洗与插值规则' })
  @RequirePermissions('gov:interpolate')
  async updateInterpolateRule(@Param('id') id: string, @Body() body: any) {
    const { device_id, tag_name, method, max_gap_minutes, status } = body;
    await this.dataSource.query(
      `UPDATE biz_interpolate_rule SET device_id = ?, tag_name = ?, method = ?, max_gap_minutes = ?, status = ? WHERE id = ?`,
      [device_id, tag_name, method, max_gap_minutes, status, id]
    );
    return { success: true };
  }

  @Delete('interpolate/rules/:id')
  @ApiOperation({ summary: '删除清洗与插值规则' })
  @RequirePermissions('gov:interpolate')
  async deleteInterpolateRule(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM biz_interpolate_rule WHERE id = ?`, [id]);
    return { success: true };
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
