import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('报警风暴收敛中心')
@ApiBearerAuth()
@Controller('workflow/alarm')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AlarmController {
  constructor(private dataSource: DataSource) {}

  @Get('events')
  @ApiOperation({ summary: '获取报警事件列表' })
  @RequirePermissions('workflow:alarm')
  async getEvents() {
    const query = `
      SELECT e.*, d.device_name, d.device_code as mapped_device_code
      FROM alm_event e
      LEFT JOIN ast_device d ON e.device_code = d.device_code
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

  @Get('rules')
  @ApiOperation({ summary: '获取报警规则列表' })
  @RequirePermissions('workflow:alarm')
  async getRules() {
    const query = `
      SELECT r.*, d.device_name, s.sop_name
      FROM alm_rule r
      LEFT JOIN ast_device d ON r.device_code = d.device_code
      LEFT JOIN alm_sop s ON r.sop_id = s.id
      ORDER BY r.id DESC
    `;
    return await this.dataSource.query(query);
  }

  @Post('rules')
  @ApiOperation({ summary: '新增报警规则' })
  @RequirePermissions('workflow:alarm')
  async createRule(@Body() body: any) {
    const { rule_name, rule_type, device_code, zone_id, tag_name, condition_type, threshold, alarm_level, sop_id, is_enabled } = body;
    await this.dataSource.query(
      `INSERT INTO alm_rule (rule_name, rule_type, device_code, zone_id, tag_name, condition_type, threshold, alarm_level, sop_id, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rule_name, rule_type || 1, device_code || null, zone_id || null, tag_name, condition_type, threshold, alarm_level || 3, sop_id || null, is_enabled ?? 1]
    );
    return { success: true };
  }

  @Put('rules/:id')
  @ApiOperation({ summary: '修改报警规则' })
  @RequirePermissions('workflow:alarm')
  async updateRule(@Param('id') id: string, @Body() body: any) {
    const { rule_name, rule_type, device_code, zone_id, tag_name, condition_type, threshold, alarm_level, sop_id, is_enabled } = body;
    await this.dataSource.query(
      `UPDATE alm_rule SET rule_name=?, rule_type=?, device_code=?, zone_id=?, tag_name=?, condition_type=?, threshold=?, alarm_level=?, sop_id=?, is_enabled=? WHERE id=?`,
      [rule_name, rule_type || 1, device_code || null, zone_id || null, tag_name, condition_type, threshold, alarm_level || 3, sop_id || null, is_enabled ?? 1, id]
    );
    return { success: true };
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: '删除报警规则' })
  @RequirePermissions('workflow:alarm')
  async deleteRule(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM alm_rule WHERE id = ?`, [id]);
    return { success: true };
  }
}
