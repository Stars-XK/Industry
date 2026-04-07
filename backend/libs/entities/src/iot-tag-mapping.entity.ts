import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('iot_tag_mapping')
@Unique(['device_id', 'tag_name'])
export class IotTagMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '关联的资产设备ID' })
  device_id: number;

  @Column({ length: 100, comment: '原始测点标签名 (如 PLC.S7.Temp)' })
  tag_name: string;

  @Column({ length: 100, comment: '标准化属性名 (如 temperature)' })
  standard_name: string;

  @Column({ length: 50, default: 'float', comment: '数据类型' })
  data_type: string;

  @Column({ length: 50, default: '', comment: '单位 (如 °C, MPa)' })
  unit: string;

  @Column({ type: 'float', default: 1.0, comment: '缩放因子' })
  scaling_factor: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否启用' })
  is_active: number;

  @Column({ length: 255, default: '', comment: '备注说明' })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
