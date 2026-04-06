import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sys_role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  role_name: string;

  @Column({ length: 100, unique: true })
  role_key: string;

  @Column({ type: 'smallint', default: 2 })
  data_scope: number; // 数据范围: 1-全部, 2-本部门, 3-自定义
}
