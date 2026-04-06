import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sys_dict_data')
export class DictData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  dict_sort: number;

  @Column({ length: 100 })
  dict_label: string;

  @Column({ length: 100 })
  dict_value: string;

  @Column({ length: 100 })
  dict_type: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;
}
