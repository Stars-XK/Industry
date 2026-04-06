import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CoreBaseEntity } from './base.entity';

@Entity('sys_menu')
export class Menu extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  parent_id: number;

  @Column({ length: 100 })
  menu_name: string;

  @Column({ length: 200, nullable: true })
  path: string;

  @Column({ length: 255, nullable: true })
  component: string;

  @Column({ length: 100, nullable: true })
  perm_code: string;

  @Column({ type: 'char', length: 1, default: 'C' })
  menu_type: string; // M-目录, C-菜单, F-按钮
}
