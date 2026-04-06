import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CoreBaseEntity } from './base.entity';

@Entity('sys_dept')
export class Dept extends CoreBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  parent_id: number;

  @Column({ length: 100 })
  dept_name: string;
}
