import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SysBackupLog } from '../../../../libs/entities/src/sys-backup-log.entity';
import { exec } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = util.promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(SysBackupLog)
    private readonly backupRepository: Repository<SysBackupLog>,
  ) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // 每天早上8点到晚上8点，每2小时执行一次备份 (8, 10, 12, 14, 16, 18, 20)
  @Cron('0 0 8,10,12,14,16,18,20 * * *')
  async handleCronBackup() {
    this.logger.debug('执行定时数据库备份...');
    const dbHost = process.env.DB_HOST || '139.224.26.134';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'Industry';
    const dbPwd = process.env.DB_PWD || 'nDTe2mNcSMadmY3S';
    const dbName = process.env.DB_NAME || 'Industry';

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const fileName = `backup_auto_${timestamp}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    const dumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPwd} ${dbName} > ${filePath}`;

    try {
      await execPromise(dumpCmd);
      const stats = fs.statSync(filePath);

      const log = this.backupRepository.create({
        fileName,
        filePath,
        fileSize: stats.size,
        backupType: 1, // 1-自动定时
        status: 1,
        remark: '自动定时备份',
        createdBy: 1 // 假设 admin
      });

      await this.backupRepository.save(log);
      this.logger.log(`定时备份成功: ${fileName}`);
    } catch (error) {
      this.logger.error(`定时备份失败: ${error.message}`);
      const log = this.backupRepository.create({
        fileName,
        filePath,
        fileSize: 0,
        backupType: 1,
        status: 0,
        remark: `定时备份失败: ${error.message.substring(0, 200)}`,
        createdBy: 1
      });
      await this.backupRepository.save(log);
    }
  }

  // 每天凌晨2点清理7天前的备份文件
  @Cron('0 0 2 * * *')
  async handleCleanupBackup() {
    this.logger.debug('执行过期备份清理 (保留7天)...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldBackups = await this.backupRepository.find({
      where: {
        createdAt: LessThan(sevenDaysAgo)
      }
    });

    for (const backup of oldBackups) {
      try {
        if (fs.existsSync(backup.filePath)) {
          fs.unlinkSync(backup.filePath);
        }
        await this.backupRepository.remove(backup);
        this.logger.log(`已清理过期备份: ${backup.fileName}`);
      } catch (e) {
        this.logger.error(`清理备份失败 ${backup.fileName}: ${e.message}`);
      }
    }
  }
}
