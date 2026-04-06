import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { CoreBaseEntity } from './base.entity';
import { Role } from './role.entity';

@Entity('sys_user')
export class User extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password?: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column()
  dept_id: number;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'sys_user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];
}
