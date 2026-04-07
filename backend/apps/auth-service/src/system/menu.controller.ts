import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../../../libs/entities/src/menu.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('api/system/menu')
@UseGuards(AuthGuard('jwt'))
export class SystemMenuController {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树' })
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
    return buildTree(menus, 0);
  }

  @Post('create')
  @ApiOperation({ summary: '创建菜单' })
  async createMenu(@Request() req, @Body() body: CreateMenuDto) {
    const menu = new Menu();
    menu.parent_id = body.parent_id || 0;
    menu.menu_name = body.menu_name;
    if (body.path !== undefined) menu.path = body.path;
    if (body.component !== undefined) menu.component = body.component;
    if (body.perm_code !== undefined) menu.perm_code = body.perm_code;
    menu.menu_type = body.menu_type || 'C';
    menu.created_by = req.user.userId;
    await this.menuRepository.save(menu);
    return null;
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新菜单' })
  async updateMenu(@Request() req, @Param('id') id: number, @Body() body: UpdateMenuDto) {
    await this.menuRepository.update(id, { ...body, updated_by: req.user.userId });
    return null;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除菜单' })
  async deleteMenu(@Param('id') id: number) {
    const hasChildren = await this.menuRepository.count({ where: { parent_id: id } });
    if (hasChildren > 0) {
      throw new BadRequestException('存在子菜单，不允许删除');
    }
    await this.menuRepository.softDelete(id);
    return null;
  }
}
