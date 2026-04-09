import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gov_datasource_config')
export class GovDatasourceConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'source_name', type: 'varchar', length: 100 })
  sourceName: string;

  @Column({ name: 'source_type', type: 'varchar', length: 50 })
  sourceType: string;

  @Column({ name: 'connection_config', type: 'text', nullable: true })
  connectionConfig: string;

  @Column({ name: 'cron_expression', type: 'varchar', length: 50, nullable: true })
  cronExpression: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remark: string;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted: number;
}
