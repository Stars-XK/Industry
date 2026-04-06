import { Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class CoreBaseEntity {
  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @Column({ nullable: true, comment: '创建人ID' })
  created_by: number;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;

  @Column({ nullable: true, comment: '更新人ID' })
  updated_by: number;

  @DeleteDateColumn({ comment: '逻辑删除标识' })
  is_deleted: Date;
}
