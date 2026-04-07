import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dept } from '../../../../libs/entities/src/dept.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDeptDto, UpdateDeptDto } from './dto/dept.dto';

@ApiTags('部门管理')
@ApiBearerAuth()
@Controller('api/system/dept')
@UseGuards(AuthGuard('jwt'))
export class DeptController {
  constructor(
    @InjectRepository(Dept)
    private readonly deptRepository: Repository<Dept>,
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取部门树' })
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
    return buildTree(depts, 0);
  }

  @Post('create')
  @ApiOperation({ summary: '创建部门' })
  async createDept(@Request() req, @Body() body: CreateDeptDto) {
    const dept = new Dept();
    dept.dept_name = body.dept_name;
    dept.parent_id = body.parent_id || 0;
    dept.created_by = req.user.userId;
    await this.deptRepository.save(dept);
    return null;
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新部门' })
  async updateDept(@Request() req, @Param('id') id: number, @Body() body: UpdateDeptDto) {
    await this.deptRepository.update(id, { ...body, updated_by: req.user.userId });
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除部门' })
  async deleteDept(@Param('id') id: number) {
    const hasChildren = await this.deptRepository.count({ where: { parent_id: id } });
    if (hasChildren > 0) {
      throw new BadRequestException('存在子部门，不允许删除');
    }
    // 使用软删除
    await this.deptRepository.softDelete(id);
    return null;
  }
}
