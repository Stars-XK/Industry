import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('排班调度')
@ApiBearerAuth()
@Controller('workflow/duty')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DutyController {
  constructor(private dataSource: DataSource) {}

  @Get('schedule')
  @ApiOperation({ summary: '获取排班表' })
  @RequirePermissions('work:duty')
  async getSchedule(@Query('month') month: string) {
    const start = `${month}-01`;
    const end = `${month}-31`;
    const query = `
      SELECT d.*, u.nickname, u.phone 
      FROM wf_duty_schedule d
      JOIN sys_user u ON d.user_id = u.id
      WHERE d.duty_date >= ? AND d.duty_date <= ?
      ORDER BY d.duty_date ASC, d.shift_type ASC
    `;
    return await this.dataSource.query(query, [start, end]);
  }

  @Post('schedule')
  @ApiOperation({ summary: '新建排班' })
  @RequirePermissions('work:duty')
  async createSchedule(@Body() body: any) {
    const { user_id, duty_date, shift_type } = body;
    await this.dataSource.query(
      `INSERT INTO wf_duty_schedule (user_id, duty_date, shift_type) VALUES (?, ?, ?)`,
      [user_id, duty_date, shift_type]
    );
    return { success: true };
  }

  @Put('schedule/:id/attend')
  @ApiOperation({ summary: '排班打卡' })
  @RequirePermissions('work:duty')
  async markAttend(@Param('id') id: string) {
    await this.dataSource.query(`UPDATE wf_duty_schedule SET is_attended = 1 WHERE id = ?`, [id]);
    return { success: true };
  }

  @Delete('schedule/:id')
  @ApiOperation({ summary: '删除排班' })
  @RequirePermissions('work:duty')
  async deleteSchedule(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM wf_duty_schedule WHERE id = ?`, [id]);
    return { success: true };
  }
}
