import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../../../libs/entities/src/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  /**
   * 将平铺的菜单数组转为树形结构
   */
  private buildMenuTree(menus: Menu[], parentId: number | string = 0): any[] {
    return menus
      // 将两者统一转为 Number 比较，防止 TypeORM 的 BIGINT 映射为 String 造成严格比较失败
      .filter((menu) => Number(menu.parent_id) === Number(parentId))
      .map((menu) => ({
        ...menu,
        children: this.buildMenuTree(menus, menu.id),
      }));
  }

  async getUserMenus(userId: number): Promise<any> {
    // 工业级应用中，这里应通过 user -> role -> menu 多表联查
    // 当前阶段一我们直接查询并返回所有菜单作为演示打通
    const menus = await this.menuRepository.find({
      order: { id: 'ASC' }
    });
    
    const tree = this.buildMenuTree(menus, 0);
    return tree;
  }
}
