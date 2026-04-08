import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('报警风暴收敛中心')
@ApiBearerAuth()
@Controller('api/workflow/alarm')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AlarmController {
  constructor(private dataSource: DataSource) {}

  @Get('events')
  @ApiOperation({ summary: '获取报警事件列表' })
  @RequirePermissions('workflow:alarm')
  async getEvents() {
    const query = `
      SELECT e.*, d.device_code, d.device_name, s.sop_name 
      FROM alm_event e
      LEFT JOIN ast_device d ON e.device_id = d.id
      LEFT JOIN alm_sop s ON e.sop_id = s.id
      ORDER BY e.id DESC LIMIT 500
    `;
    return await this.dataSource.query(query);
  }

  @Put('events/:id/confirm')
  @ApiOperation({ summary: '确认报警' })
  @RequirePermissions('workflow:alarm')
  async confirmEvent(@Param('id') id: string) {
    await this.dataSource.query(`UPDATE alm_event SET status = 1 WHERE id = ?`, [id]);
    return { success: true };
  }

  @Put('events/:id/recover')
  @ApiOperation({ summary: '手动恢复报警' })
  @RequirePermissions('workflow:alarm')
  async recoverEvent(@Param('id') id: string) {
    await this.dataSource.query(
      `UPDATE alm_event SET status = 2, recover_time = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    return { success: true };
  }

  @Delete('events/:id')
  @ApiOperation({ summary: '删除/清除报警' })
  @RequirePermissions('workflow:alarm')
  async deleteEvent(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM alm_event WHERE id = ?`, [id]);
    return { success: true };
  }
}
