import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { CoreBaseEntity } from './base.entity';
import { Menu } from './menu.entity';

@Entity('sys_role')
export class Role extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: '角色名称' })
  role_name: string;

  @Column({ length: 100, unique: true, comment: '角色权限字符串' })
  role_key: string;

  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  role_sort: number;

  @Column({ type: 'smallint', default: 2, comment: '数据范围（1全部 2本部门 3自定义）' })
  data_scope: number;

  @Column({ type: 'smallint', default: 1, comment: '角色状态（1正常 0停用）' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'sys_role_menu',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' }
  })
  menus: Menu[];
}
