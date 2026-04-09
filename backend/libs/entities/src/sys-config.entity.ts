import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sys_config')
export class SysConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'config_name', length: 100, comment: '配置名称' })
  configName: string;

  @Column({ name: 'config_key', length: 100, unique: true, comment: '配置键名' })
  configKey: string;

  @Column({ name: 'config_value', type: 'text', nullable: true, comment: '配置键值' })
  configValue: string;

  @Column({ name: 'config_type', length: 1, default: 'N', comment: '系统内置: Y-是, N-否' })
  configType: string;

  @Column({ length: 500, nullable: true, comment: '备注说明' })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;
}
