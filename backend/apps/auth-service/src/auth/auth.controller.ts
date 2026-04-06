import { Controller, Post, Body, UnauthorizedException, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    if (!body.username || !body.password) {
      throw new UnauthorizedException('请输入用户名和密码');
    }
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  // 测试 JWT 是否有效的保护接口
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return { code: 200, data: req.user, message: '获取成功' };
  }
}
