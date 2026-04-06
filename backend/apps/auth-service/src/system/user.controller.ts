import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../libs/entities/src/user.entity';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';

@Controller('api/system/user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('list')
  async getUserList(@Query('page') page = 1, @Query('size') size = 10) {
    const [list, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      select: ['id', 'username', 'phone', 'dept_id', 'status', 'created_at'] // 不返回密码
    });
    return { code: 200, data: { list, total }, message: 'success' };
  }

  @Post('create')
  async createUser(@Body() body: any) {
    const user = new User();
    user.username = body.username;
    // 默认密码 123456 加密
    user.password = await bcrypt.hash('123456', 10);
    user.phone = body.phone;
    user.dept_id = body.dept_id;
    await this.userRepository.save(user);
    return { code: 200, message: '创建成功' };
  }

  @Put('update/:id')
  async updateUser(@Param('id') id: number, @Body() body: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.phone = body.phone || user.phone;
      user.dept_id = body.dept_id || user.dept_id;
      user.status = body.status !== undefined ? body.status : user.status;
      await this.userRepository.save(user);
    }
    return { code: 200, message: '更新成功' };
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: number) {
    await this.userRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }
}
