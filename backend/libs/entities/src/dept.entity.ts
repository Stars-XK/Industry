import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sys_dept')
export class Dept {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  parent_id: number;

  @Column({ length: 100 })
  dept_name: string;

  @CreateDateColumn()
  created_at: Date;
}
