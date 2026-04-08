import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { AuditLog } from '../../../../libs/entities/src/audit-log.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('安全审计管理')
@ApiBearerAuth()
@Controller('system/audit')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取审计日志列表' })
  async getAuditLogList(@Query('page') page = 1, @Query('limit') limit = 20) {
    const skip = (page - 1) * limit;
    const [records, total] = await this.auditLogRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: skip,
      take: limit,
    });
    return {
      code: 200,
      data: { records, total, page: Number(page), limit: Number(limit) },
      message: 'success',
    };
  }
}
