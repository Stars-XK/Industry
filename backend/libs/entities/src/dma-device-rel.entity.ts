import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('dma_device_rel')
export class DmaDeviceRel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '分区ID' })
  zone_id: number;

  @Column({ type: 'int', comment: '设备ID' })
  device_id: number;

  @Column({ type: 'tinyint', default: 1, comment: '1-流入, -1-流出, 0-内部' })
  direction: number;

  @CreateDateColumn()
  created_at: Date;
}
