import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('SOP 应急预案库')
@ApiBearerAuth()
@Controller('api/workflow/sop')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SopController {
  constructor(private dataSource: DataSource) {}

  @Get('list')
  @ApiOperation({ summary: '获取SOP预案列表' })
  @RequirePermissions('workflow:sop')
  async getSops() {
    return await this.dataSource.query(`SELECT * FROM alm_sop ORDER BY id DESC`);
  }

  @Post()
  @ApiOperation({ summary: '新增SOP预案' })
  @RequirePermissions('workflow:sop')
  async createSop(@Body() body: any, @Request() req: any) {
    const { sop_name, alarm_type, steps_json, status } = body;
    await this.dataSource.query(
      `INSERT INTO alm_sop (sop_name, alarm_type, steps_json, status, created_by) VALUES (?, ?, ?, ?, ?)`,
      [sop_name, alarm_type, JSON.stringify(steps_json || []), status ?? 1, req.user.userId]
    );
    return { success: true };
  }

  @Put(':id')
  @ApiOperation({ summary: '修改SOP预案' })
  @RequirePermissions('workflow:sop')
  async updateSop(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const { sop_name, alarm_type, steps_json, status } = body;
    await this.dataSource.query(
      `UPDATE alm_sop SET sop_name = ?, alarm_type = ?, steps_json = ?, status = ?, updated_by = ? WHERE id = ?`,
      [sop_name, alarm_type, JSON.stringify(steps_json || []), status, req.user.userId, id]
    );
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除SOP预案' })
  @RequirePermissions('workflow:sop')
  async deleteSop(@Param('id') id: string) {
    const inUse = await this.dataSource.query(`SELECT id FROM alm_event WHERE sop_id = ?`, [id]);
    if (inUse.length > 0) throw new Error('该预案已被历史报警事件关联，禁止删除');

    await this.dataSource.query(`DELETE FROM alm_sop WHERE id = ?`, [id]);
    return { success: true };
  }
}
