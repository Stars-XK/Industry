import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('菜单动态拉取')
@ApiBearerAuth()
@Controller('api/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // 获取当前登录用户拥有的动态菜单树
  @UseGuards(AuthGuard('jwt'))
  @Get('my-menus')
  @ApiOperation({ summary: '获取当前用户的动态菜单树' })
  async getMyMenus(@Request() req) {
    const userId = req.user.userId;
    return this.menuService.getUserMenus(userId);
  }
}
