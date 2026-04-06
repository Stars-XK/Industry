import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../../../libs/entities/src/role.entity';
import { Menu } from '../../../../libs/entities/src/menu.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('api/system/role')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取角色列表' })
  async getRoleList() {
    const list = await this.roleRepository.find();
    return list;
  }

  @Post('create')
  @ApiOperation({ summary: '创建角色' })
  async createRole(@Body() body: CreateRoleDto) {
    const role = new Role();
    role.role_name = body.role_name;
    role.role_key = body.role_key;
    role.data_scope = body.data_scope || 2;
    
    if (body.menu_ids && body.menu_ids.length > 0) {
      const menus = await this.menuRepository.find({ where: { id: In(body.menu_ids) } });
      role.menus = menus;
    }

    await this.roleRepository.save(role);
    return null;
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新角色' })
  async updateRole(@Param('id') id: number, @Body() body: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['menus'] });
    if (role) {
      if (body.role_name !== undefined) role.role_name = body.role_name;
      if (body.role_key !== undefined) role.role_key = body.role_key;
      if (body.data_scope !== undefined) role.data_scope = body.data_scope;
      
      if (body.menu_ids !== undefined) {
        if (body.menu_ids.length > 0) {
          const menus = await this.menuRepository.find({ where: { id: In(body.menu_ids) } });
          role.menus = menus;
        } else {
          role.menus = [];
        }
      }
      await this.roleRepository.save(role);
    }
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除角色' })
  async deleteRole(@Param('id') id: number) {
    await this.roleRepository.softDelete(id);
    return null;
  }
}
