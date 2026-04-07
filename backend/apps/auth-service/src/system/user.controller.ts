import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../libs/entities/src/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions, applyDataScope } from '@app/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('api/system/user')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  @RequirePermissions('sys:user:list')
  async getUserList(@Request() req, @Query('page') page = 1, @Query('size') size = 10) {
    const user = req.user;
    
    // 使用通用数据隔离逻辑
    const qb = this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.phone', 'user.dept_id', 'user.status', 'user.created_at'])
      .skip((page - 1) * size)
      .take(size);
      
    // 调用通用的数据权限隔离工具函数
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
    // 默认密码 123456 加密
    user.password = await bcrypt.hash('123456', 10);
    user.phone = body.phone;
    user.dept_id = body.dept_id;
    user.created_by = req.user.userId;
    await this.userRepository.save(user);
    return null;
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新用户' })
  @RequirePermissions('sys:user:edit')
  async updateUser(@Request() req, @Param('id') id: number, @Body() body: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      if (body.phone !== undefined) user.phone = body.phone;
      if (body.dept_id !== undefined) user.dept_id = body.dept_id;
      if (body.status !== undefined) user.status = body.status;
      user.updated_by = req.user.userId;
      await this.userRepository.save(user);
    }
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除用户' })
  @RequirePermissions('sys:user:remove')
  async deleteUser(@Param('id') id: number) {
    // 使用软删除 (因为我们在 BaseEntity 里配置了 @DeleteDateColumn)
    await this.userRepository.softDelete(id);
    return null;
  }
}
