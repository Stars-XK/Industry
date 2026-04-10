import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dma_zone')
export class DmaZone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', default: 0, comment: '父级分区 ID' })
  parent_id: number;

  @Column({ nullable: true, length: 50, comment: '分区唯一编码' })
  zone_code: string;

  @Column({ length: 100, comment: '分区名称' })
  zone_name: string;

  @Column({ type: 'smallint', default: 1 })
  level: number;

  @Column({ type: 'text', nullable: true })
  boundary_gis: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mnf_baseline: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  center_lng: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  center_lat: number;

  @Column({ length: 20, default: 'CGCS2000' })
  crs: string;

  @Column({ type: 'json', nullable: true })
  properties: any;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'bigint', nullable: true })
  created_by: number;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'bigint', nullable: true })
  updated_by: number;

  @Column({ type: 'timestamp', nullable: true })
  is_deleted: Date;
}
