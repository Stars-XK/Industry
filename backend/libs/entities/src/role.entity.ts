import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { CoreBaseEntity } from './base.entity';
import { Menu } from './menu.entity';

@Entity('sys_role')
export class Role extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  role_name: string;

  @Column({ length: 100, unique: true })
  role_key: string;

  @Column({ type: 'smallint', default: 2 })
  data_scope: number; // 数据范围: 1-全部, 2-本部门, 3-自定义

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'sys_role_menu',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' }
  })
  menus: Menu[];
}
