import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../../../libs/entities/src/menu.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/system/menu')
@UseGuards(AuthGuard('jwt'))
export class SystemMenuController {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  @Get('tree')
  async getMenuTree() {
    const menus = await this.menuRepository.find({ order: { id: 'ASC' } });
    const buildTree = (data: Menu[], parentId = 0) => {
      return data
        .filter((node) => node.parent_id === parentId)
        .map((node) => ({
          ...node,
          children: buildTree(data, node.id),
        }));
    };
    return { code: 200, data: buildTree(menus, 0), message: 'success' };
  }

  @Post('create')
  async createMenu(@Body() body: any) {
    const menu = new Menu();
    menu.parent_id = body.parent_id || 0;
    menu.menu_name = body.menu_name;
    menu.path = body.path;
    menu.component = body.component;
    menu.perm_code = body.perm_code;
    menu.menu_type = body.menu_type || 'C';
    await this.menuRepository.save(menu);
    return { code: 200, message: '菜单创建成功' };
  }

  @Put('update/:id')
  async updateMenu(@Param('id') id: number, @Body() body: any) {
    await this.menuRepository.update(id, body);
    return { code: 200, message: '更新成功' };
  }

  @Delete('delete/:id')
  async deleteMenu(@Param('id') id: number) {
    const hasChildren = await this.menuRepository.count({ where: { parent_id: id } });
    if (hasChildren > 0) {
      return { code: 400, message: '存在子菜单，不允许删除' };
    }
    await this.menuRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }
}
