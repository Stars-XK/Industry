import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dma_zone')
export class DmaZone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', default: 0 })
  parent_id: number;

  @Column({ length: 100 })
  zone_name: string;

  @Column({ type: 'smallint', default: 1 })
  level: number;

  @Column({ type: 'text', nullable: true })
  boundary_gis: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mnf_baseline: number;

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
