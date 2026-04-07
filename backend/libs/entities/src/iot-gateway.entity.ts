import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('iot_gateway')
export class IotGateway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: '网关序列号(SN)' })
  gateway_sn: string;

  @Column({ length: 50, default: 'MQTT', comment: '通信协议(MQTT, Modbus等)' })
  protocol: string;

  @Column({ type: 'tinyint', default: 0, comment: '在线状态: 1-在线 0-离线' })
  is_online: number;

  @Column({ type: 'float', default: 0.0, comment: 'CPU负载(%)' })
  cpu_load: number;

  @Column({ type: 'int', default: 0, comment: '网络延迟(ms)' })
  latency: number;

  @Column({ length: 255, default: '', comment: '备注说明' })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
