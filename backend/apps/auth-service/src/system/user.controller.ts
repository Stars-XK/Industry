import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../../../libs/entities/src/user.entity';
import { Role } from '../../../../libs/entities/src/role.entity';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions, applyDataScope } from '@app/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('system/user')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  @RequirePermissions('sys:user:list')
  async getUserList(@Request() req, @Query('page') page = 1, @Query('size') size = 10) {
    const user = req.user;

    const qb = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .select(['user.id', 'user.username', 'user.phone', 'user.dept_id', 'user.status', 'user.created_at', 'roles.id', 'roles.role_name'])
      .skip((page - 1) * size)
      .take(size);

    applyDataScope(qb, user, 'user.dept_id');

    const [list, total] = await qb.getManyAndCount();

    return { list, total };
  }

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  @RequirePermissions('sys:user:add')
  async createUser(@Request() req, @Body() body: CreateUserDto) {
    const user = new User();
    user.username = body.username;
    user.nickname = body.nickname || body.username;
    user.password = await bcrypt.hash('123456', 10);
    user.phone = body.phone || '';
    user.dept_id = body.dept_id;
    user.created_by = req.user.userId;

    if (body.roleIds && body.roleIds.length > 0) {
      user.roles = await this.roleRepository.find({ where: { id: In(body.roleIds) } });
    }

    await this.userRepository.save(user);
    return null;
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新用户' })
  @RequirePermissions('sys:user:edit')
  async updateUser(@Request() req, @Param('id') id: number, @Body() body: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['roles'] });
    if (user) {
      if (body.phone !== undefined) user.phone = body.phone;
      if (body.dept_id !== undefined) user.dept_id = body.dept_id;
      if (body.status !== undefined) user.status = body.status;
      user.updated_by = req.user.userId;

      if (body.roleIds !== undefined) {
        if (body.roleIds.length > 0) {
          user.roles = await this.roleRepository.find({ where: { id: In(body.roleIds) } });
        } else {
          user.roles = [];
        }
      }

      await this.userRepository.save(user);
    }
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除用户' })
  @RequirePermissions('sys:user:remove')
  async deleteUser(@Param('id') id: number) {
    await this.userRepository.softDelete(id);
    return null;
  }
}
