import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../../libs/entities/src/role.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/system/role')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get('list')
  async getRoleList() {
    const list = await this.roleRepository.find();
    return { code: 200, data: list, message: 'success' };
  }

  @Post('create')
  async createRole(@Body() body: any) {
    const role = new Role();
    role.role_name = body.role_name;
    role.role_key = body.role_key;
    role.data_scope = body.data_scope || 2;
    await this.roleRepository.save(role);
    return { code: 200, message: '角色创建成功' };
  }

  @Put('update/:id')
  async updateRole(@Param('id') id: number, @Body() body: any) {
    await this.roleRepository.update(id, body);
    return { code: 200, message: '更新成功' };
  }

  @Delete('delete/:id')
  async deleteRole(@Param('id') id: number) {
    await this.roleRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }
}
