import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('工单流转')
@ApiBearerAuth()
@Controller('workflow/order')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OrderController {
  constructor(private dataSource: DataSource) {}

  @Get('list')
  @ApiOperation({ summary: '获取工单大盘列表' })
  @RequirePermissions('workflow:order')
  async getOrders() {
    const query = `
      SELECT o.*, d.device_name, d.device_code, 
             u1.nickname as creator_name, u2.nickname as handler_name,
             a.alarm_desc
      FROM wf_work_order o
      LEFT JOIN ast_device d ON o.device_code = d.device_code
      LEFT JOIN sys_user u1 ON o.creator_id = u1.id
      LEFT JOIN sys_user u2 ON o.handler_id = u2.id
      LEFT JOIN alm_event a ON o.alarm_id = a.id
      ORDER BY o.id DESC LIMIT 500
    `;
    return await this.dataSource.query(query);
  }

  @Post()
  @ApiOperation({ summary: '新建工单 (可由报警触发或手工建单)' })
  @RequirePermissions('workflow:order')
  async createOrder(@Body() body: any, @Request() req: any) {
    const { order_type, alarm_id, device_code, title, description, priority, handler_id, gis_coord } = body;
    const order_sn = `WO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await this.dataSource.query(
      `INSERT INTO wf_work_order 
       (order_sn, order_type, alarm_id, device_code, title, description, priority, status, creator_id, handler_id, gis_coord) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_sn, order_type, alarm_id || null, device_code || null, title, description, priority || 2, 10, req.user.userId, handler_id || null, gis_coord || null]
    );
    return { success: true };
  }

  @Put(':id/accept')
  @ApiOperation({ summary: '工单接单/转派' })
  @RequirePermissions('workflow:order')
  async acceptOrder(@Param('id') id: string, @Body() body: { handler_id: number }, @Request() req: any) {
    await this.dataSource.query(
      `UPDATE wf_work_order SET status = 20, handler_id = ? WHERE id = ?`,
      [body.handler_id || req.user.userId, id]
    );
    return { success: true };
  }

  @Put(':id/close')
  @ApiOperation({ summary: '工单处理闭环' })
  @RequirePermissions('workflow:order')
  async closeOrder(@Param('id') id: string, @Body() body: { result_desc: string }) {
    await this.dataSource.query(
      `UPDATE wf_work_order SET status = 30, result_desc = ? WHERE id = ?`,
      [body.result_desc, id]
    );
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除/取消工单' })
  @RequirePermissions('workflow:order')
  async deleteOrder(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM wf_work_order WHERE id = ?`, [id]);
    return { success: true };
  }

  @Get('options/users')
  @ApiOperation({ summary: '获取可派单用户列表' })
  @RequirePermissions('workflow:order')
  async getHandlers() {
    return await this.dataSource.query(`SELECT id, nickname, username FROM sys_user WHERE status = 1`);
  }
}
