import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dept } from '../../../../libs/entities/src/dept.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/system/dept')
@UseGuards(AuthGuard('jwt'))
export class DeptController {
  constructor(
    @InjectRepository(Dept)
    private readonly deptRepository: Repository<Dept>,
  ) {}

  /**
   * 获取部门树
   */
  @Get('tree')
  async getDeptTree() {
    const depts = await this.deptRepository.find({ order: { id: 'ASC' } });
    const buildTree = (data: Dept[], parentId = 0) => {
      return data
        .filter((node) => node.parent_id === parentId)
        .map((node) => ({
          ...node,
          children: buildTree(data, node.id),
        }));
    };
    return { code: 200, data: buildTree(depts, 0), message: 'success' };
  }

  @Post('create')
  async createDept(@Body() body: any) {
    const dept = new Dept();
    dept.dept_name = body.dept_name;
    dept.parent_id = body.parent_id || 0;
    await this.deptRepository.save(dept);
    return { code: 200, message: '部门创建成功' };
  }

  @Put('update/:id')
  async updateDept(@Param('id') id: number, @Body() body: any) {
    await this.deptRepository.update(id, body);
    return { code: 200, message: '更新成功' };
  }

  @Delete('delete/:id')
  async deleteDept(@Param('id') id: number) {
    const hasChildren = await this.deptRepository.count({ where: { parent_id: id } });
    if (hasChildren > 0) {
      return { code: 400, message: '存在子部门，不允许删除' };
    }
    await this.deptRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }
}
