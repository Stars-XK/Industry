import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sys_dict_type')
export class DictType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  dict_name: string;

  @Column({ length: 100, unique: true })
  dict_type: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ length: 500, nullable: true })
  remark: string;
}
