import { Controller, Get, Post, Query, UseGuards, Req, Res, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysBackupLog } from '../../../../libs/entities/src/sys-backup-log.entity';
import { AuthGuard } from '@nestjs/passport';
import { exec } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = util.promisify(exec);

@Controller('backup')
export class BackupController {
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(SysBackupLog)
    private readonly backupRepository: Repository<SysBackupLog>,
  ) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // 1. 获取备份列表
  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async getBackupList(@Query() query: any) {
    const page = parseInt(query.pageNum || '1');
    const size = parseInt(query.pageSize || '10');
    
    const queryBuilder = this.backupRepository.createQueryBuilder('backup');
    queryBuilder.orderBy('backup.createdAt', 'DESC');

    const [list, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      code: 200,
      data: { list, total },
      message: 'success'
    };
  }

  // 2. 执行立即备份
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createBackup(@Req() req: any) {
    const dbHost = process.env.DB_HOST || '139.224.26.134';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'Industry';
    const dbPwd = process.env.DB_PWD || 'nDTe2mNcSMadmY3S';
    const dbName = process.env.DB_NAME || 'Industry';

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    // 注意：如果是生产环境，密码不应直接写在命令行中。这里为了演示使用这种方式。
    const dumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPwd} ${dbName} > ${filePath}`;

    try {
      await execPromise(dumpCmd);
      const stats = fs.statSync(filePath);

      const log = this.backupRepository.create({
        fileName,
        filePath,
        fileSize: stats.size,
        backupType: 2, // 2-手动
        status: 1,
        remark: '手动执行备份',
        createdBy: req.user?.userId
      });

      await this.backupRepository.save(log);
      return { code: 200, message: '备份成功' };
    } catch (error) {
      console.error('备份失败:', error);
      const log = this.backupRepository.create({
        fileName,
        filePath,
        fileSize: 0,
        backupType: 2,
        status: 0,
        remark: `备份失败: ${error.message.substring(0, 200)}`,
        createdBy: req.user?.userId
      });
      await this.backupRepository.save(log);
      throw new HttpException('备份执行失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. 一键恢复
  @UseGuards(AuthGuard('jwt'))
  @Post('restore')
  async restoreBackup(@Body() body: { id: number }) {
    const log = await this.backupRepository.findOne({ where: { id: body.id } });
    if (!log || log.status !== 1) {
      throw new HttpException('无效的备份记录', HttpStatus.BAD_REQUEST);
    }

    if (!fs.existsSync(log.filePath)) {
      throw new HttpException('备份文件在磁盘上已丢失', HttpStatus.NOT_FOUND);
    }

    const dbHost = process.env.DB_HOST || '139.224.26.134';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'Industry';
    const dbPwd = process.env.DB_PWD || 'nDTe2mNcSMadmY3S';
    const dbName = process.env.DB_NAME || 'Industry';

    const restoreCmd = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPwd} ${dbName} < ${log.filePath}`;

    try {
      await execPromise(restoreCmd);
      return { code: 200, message: '系统数据恢复成功' };
    } catch (error) {
      console.error('恢复失败:', error);
      throw new HttpException('恢复执行失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
