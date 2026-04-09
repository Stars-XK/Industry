import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sys_backup_log')
export class SysBackupLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name', length: 255, comment: '备份文件名称' })
  fileName: string;

  @Column({ name: 'file_path', length: 500, comment: '物理存储路径' })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint', default: 0, comment: '文件大小 (字节)' })
  fileSize: number;

  @Column({ name: 'backup_type', type: 'smallint', default: 1, comment: '备份类型: 1-自动定时, 2-手动' })
  backupType: number;

  @Column({ type: 'smallint', default: 1, comment: '状态: 1-成功, 0-失败' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;
}
