import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sys_audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ length: 50, nullable: true })
  ip_address: string;

  @Column({ length: 10, nullable: true })
  req_method: string;

  @Column({ length: 255, nullable: true })
  req_url: string;

  @Column({ type: 'json', nullable: true })
  req_body: any;

  @Column({ nullable: true })
  execution_time: number; // in milliseconds

  @CreateDateColumn()
  created_at: Date;
}
