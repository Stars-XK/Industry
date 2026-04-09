import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, HttpException, HttpStatus, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../../../libs/entities/src/user.entity';
import { Dept } from '../../../../libs/entities/src/dept.entity';
import { Role } from '../../../../libs/entities/src/role.entity';
import { DictType } from '../../../../libs/entities/src/dict-type.entity';
import { DictData } from '../../../../libs/entities/src/dict-data.entity';
import { SysBackupLog } from '../../../../libs/entities/src/sys-backup-log.entity';
import { AuditLog } from '../../../../libs/entities/src/audit-log.entity';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import { exec } from 'child_process';

const execPromise = util.promisify(exec);

@Controller('system/wizard')
export class WizardController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Dept) private deptRepository: Repository<Dept>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(DictType) private dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData) private dictDataRepository: Repository<DictData>,
    @InjectRepository(SysBackupLog) private backupRepository: Repository<SysBackupLog>,
    @InjectRepository(AuditLog) private auditLogRepository: Repository<AuditLog>,
    private dataSource: DataSource
  ) {}

  /**
   * 自动在导入前进行全量备份
   */
  private async triggerPreImportBackup(userId: number) {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const fileName = `pre_import_backup_${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const dbHost = process.env.DB_HOST || '139.224.26.134';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'Industry';
    const dbPwd = process.env.DB_PWD || 'nDTe2mNcSMadmY3S';
    const dbName = process.env.DB_NAME || 'Industry';

    const dumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPwd} ${dbName} > ${filePath}`;

    try {
      await execPromise(dumpCmd);
      const stats = fs.statSync(filePath);

      const log = this.backupRepository.create({
        fileName,
        filePath,
        fileSize: stats.size,
        backupType: 2, // 2-手动(覆盖导入前强制)
        status: 1,
        remark: '覆盖导入前系统强制自动备份',
        createdBy: userId
      });
      await this.backupRepository.save(log);
    } catch (error) {
      console.error('导入前强制备份失败:', error);
      throw new HttpException('为防止数据灾难，导入前必须执行备份。当前备份失败，已终止导入！', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new HttpException('文件不能为空', HttpStatus.BAD_REQUEST);

    const userId = req.user?.userId || 1;

    // 0. 保存上传的文件到磁盘
    const uploadDir = path.join(process.cwd(), 'uploads', 'wizard');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const savedFileName = `wizard_import_${timestamp}_${file.originalname}`;
    const savedFilePath = path.join(uploadDir, savedFileName);
    fs.writeFileSync(savedFilePath, file.buffer);

    // 1. 强制备份
    await this.triggerPreImportBackup(userId);

    // 2. 解析 Excel
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const resultLog = [];

    // 使用事务保证原子性
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 解析 Sheet: Dept
      if (workbook.SheetNames.includes('Dept')) {
        const deptSheet = workbook.Sheets['Dept'];
        const depts = xlsx.utils.sheet_to_json(deptSheet);
        await queryRunner.manager.clear(Dept);
        for (const row of depts as any[]) {
          const dept = new Dept();
          dept.id = row.id;
          dept.parent_id = row.parent_id;
          dept.dept_name = row.dept_name;
          dept.sort_order = row.order_num || 0;
          await queryRunner.manager.save(dept);
        }
        resultLog.push(`成功导入部门 ${depts.length} 条`);
      }

      // 解析 Sheet: Role
      if (workbook.SheetNames.includes('Role')) {
        const roleSheet = workbook.Sheets['Role'];
        const roles = xlsx.utils.sheet_to_json(roleSheet);
        await queryRunner.manager.clear(Role);
        for (const row of roles as any[]) {
          const role = new Role();
          role.id = row.id;
          role.role_name = row.role_name;
          role.role_key = row.role_key;
          await queryRunner.manager.save(role);
        }
        resultLog.push(`成功导入角色 ${roles.length} 条`);
      }

      await queryRunner.commitTransaction();

      // 3. 记录审计日志
      const auditLog = this.auditLogRepository.create({
        req_url: '/api/v1/system/wizard/import',
        req_method: 'POST',
        user_id: userId,
        ip_address: req.ip || req.connection.remoteAddress,
        req_body: { result: resultLog, file: savedFilePath }
      });
      await this.auditLogRepository.save(auditLog);

      return { code: 200, message: '导入并覆盖成功', data: resultLog };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      const auditLog = this.auditLogRepository.create({
        req_url: '/api/v1/system/wizard/import',
        req_method: 'POST',
        user_id: userId,
        ip_address: req.ip || req.connection.remoteAddress,
        req_body: { error: error.message, file: savedFilePath }
      });
      await this.auditLogRepository.save(auditLog);

      throw new HttpException('导入解析失败: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }
}
