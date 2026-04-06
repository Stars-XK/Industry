import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { CoreBaseEntity } from './base.entity';
import { Role } from './role.entity';

@Entity('sys_user')
export class User extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: '登录账号' })
  username: string;

  @Column({ length: 255, comment: '密码' })
  password?: string;

  @Column({ length: 30, default: '', comment: '用户昵称' })
  nickname: string;

  @Column({ length: 50, default: '', comment: '用户邮箱' })
  email: string;

  @Column({ length: 20, default: '', comment: '手机号码' })
  phone: string;

  @Column({ type: 'smallint', default: 0, comment: '用户性别（0未知 1男 2女）' })
  gender: number;

  @Column({ length: 255, default: '', comment: '头像地址' })
  avatar: string;

  @Column({ nullable: true, comment: '部门ID' })
  dept_id: number;

  @Column({ type: 'smallint', default: 1, comment: '帐号状态（1正常 0停用 2锁定）' })
  status: number;

  @Column({ length: 50, default: '', comment: '最后登录IP' })
  last_login_ip: string;

  @Column({ type: 'datetime', nullable: true, comment: '最后登录时间' })
  last_login_time: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];
}
