import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CoreBaseEntity } from './base.entity';

@Entity('sys_dept')
export class Dept extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0, comment: '父部门ID' })
  parent_id: number;

  @Column({ length: 100, default: '', comment: '祖级列表' })
  ancestors: string;

  @Column({ length: 100, comment: '部门名称' })
  dept_name: string;

  @Column({ type: 'int', default: 0, comment: '显示顺序' })
  sort_order: number;

  @Column({ length: 20, nullable: true, comment: '负责人' })
  leader: string;

  @Column({ length: 20, nullable: true, comment: '联系电话' })
  phone: string;

  @Column({ length: 50, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ type: 'smallint', default: 1, comment: '部门状态（1正常 0停用）' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}
