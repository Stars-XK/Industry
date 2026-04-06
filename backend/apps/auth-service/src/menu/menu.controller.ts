import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 获取当前登录用户拥有的动态菜单树
  @UseGuards(AuthGuard('jwt'))
  @Get('my-menus')
  async getMyMenus(@Request() req) {
    const userId = req.user.userId;
    return this.menuService.getUserMenus(userId);
  }
}
