import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { AuditLog } from '../../../../libs/entities/src/audit-log.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('安全审计管理')
@ApiBearerAuth()
@Controller('api/system/audit')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取审计日志列表' })
  // @RequirePermissions('sys:audit:list') // 如果需要权限可以打开
  async getAuditLogList(@Query('page') page = 1, @Query('size') size = 20) {
    const [list, total] = await this.auditLogRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { list, total };
  }
}
