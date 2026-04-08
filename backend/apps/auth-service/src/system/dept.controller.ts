import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('组织架构管理')
@ApiBearerAuth()
@Controller('system/dept')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DeptController {
  constructor(private dataSource: DataSource) {}

  @Get('tree')
  @ApiOperation({ summary: '获取组织架构树' })
  @RequirePermissions('sys:org')
  async getDeptTree() {
    const depts = await this.dataSource.query(`SELECT * FROM sys_dept WHERE is_deleted IS NULL ORDER BY sort_order ASC`);
    return this.buildTree(depts, 0);
  }

  @Post()
  @ApiOperation({ summary: '新增部门' })
  @RequirePermissions('sys:org')
  async createDept(@Body() body: any) {
    const { parent_id, dept_name, sort_order, leader, phone, email, status } = body;
    await this.dataSource.query(
      `INSERT INTO sys_dept (parent_id, dept_name, sort_order, leader, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [parent_id || 0, dept_name, sort_order || 0, leader, phone, email, status ?? 1]
    );
    return { success: true };
  }

  @Put(':id')
  @ApiOperation({ summary: '修改部门' })
  @RequirePermissions('sys:org')
  async updateDept(@Param('id') id: string, @Body() body: any) {
    const { parent_id, dept_name, sort_order, leader, phone, email, status } = body;
    await this.dataSource.query(
      `UPDATE sys_dept SET parent_id = ?, dept_name = ?, sort_order = ?, leader = ?, phone = ?, email = ?, status = ? WHERE id = ?`,
      [parent_id, dept_name, sort_order, leader, phone, email, status, id]
    );
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @RequirePermissions('sys:org')
  async deleteDept(@Param('id') id: string) {
    const children = await this.dataSource.query(`SELECT id FROM sys_dept WHERE parent_id = ? AND is_deleted IS NULL`, [id]);
    if (children.length > 0) throw new Error('存在下级部门，禁止删除');
    
    const users = await this.dataSource.query(`SELECT id FROM sys_user WHERE dept_id = ? AND status != 0`, [id]);
    if (users.length > 0) throw new Error('该部门下存在用户，禁止删除');

    await this.dataSource.query(`UPDATE sys_dept SET is_deleted = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
    return { success: true };
  }

  private buildTree(depts: any[], parentId: number): any[] {
    return depts
      .filter((d) => Number(d.parent_id) === Number(parentId))
      .map((d) => ({
        ...d,
        label: d.dept_name,
        children: this.buildTree(depts, d.id),
      }));
  }
}
