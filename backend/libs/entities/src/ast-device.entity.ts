import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ast_device')
export class AstDevice {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 50, unique: true })
  device_code: string;

  @Column({ length: 200 })
  device_name: string;

  @Column({ type: 'smallint' })
  device_type: number;

  @Column({ type: 'date', nullable: true })
  install_date: Date;

  @Column({ length: 100, nullable: true })
  gis_coord: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'bigint', nullable: true })
  created_by: number;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'bigint', nullable: true })
  updated_by: number;
}
