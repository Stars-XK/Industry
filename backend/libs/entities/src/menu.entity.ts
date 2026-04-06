import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CoreBaseEntity } from './base.entity';

@Entity('sys_menu')
export class Menu extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0, comment: '父菜单ID' })
  parent_id: number;

  @Column({ length: 100, comment: '菜单名称' })
  menu_name: string;

  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  sort_order: number;

  @Column({ length: 200, default: '', comment: '路由地址' })
  path: string;

  @Column({ length: 255, nullable: true, comment: '组件路径' })
  component: string;

  @Column({ type: 'smallint', default: 0, comment: '是否为外链（1是 0否）' })
  is_frame: number;

  @Column({ type: 'smallint', default: 0, comment: '是否缓存（1缓存 0不缓存）' })
  is_cache: number;

  @Column({ type: 'char', length: 1, default: 'C', comment: '菜单类型（M目录 C菜单 F按钮）' })
  menu_type: string;

  @Column({ type: 'smallint', default: 1, comment: '菜单显示状态（1显示 0隐藏）' })
  visible: number;

  @Column({ type: 'smallint', default: 1, comment: '菜单状态（1正常 0停用）' })
  status: number;

  @Column({ length: 100, nullable: true, comment: '权限标识' })
  perm_code: string;

  @Column({ length: 100, default: '#', comment: '菜单图标' })
  icon: string;

  @Column({ length: 500, default: '', comment: '备注' })
  remark: string;
}
