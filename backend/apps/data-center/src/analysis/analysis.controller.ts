import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('漏损与流量分析')
@ApiBearerAuth()
@Controller('api/data-center/analysis')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AnalysisController {
  constructor(private dataSource: DataSource) {}

  @Get('mnf')
  @ApiOperation({ summary: '夜间最小流量(MNF)分析列表' })
  @RequirePermissions('analytics:mnf')
  async getMnfData(@Query('zoneId') zoneId?: string) {
    let query = `
      SELECT m.*, z.zone_name 
      FROM biz_mnf_analysis m 
      JOIN dma_zone z ON m.zone_id = z.id 
      WHERE 1=1
    `;
    const params = [];
    if (zoneId) {
      query += ` AND m.zone_id = ?`;
      params.push(zoneId);
    }
    query += ` ORDER BY m.analysis_date DESC LIMIT 30`;
    return await this.dataSource.query(query, params);
  }

  @Get('nrw')
  @ApiOperation({ summary: '产销差(NRW)报表' })
  @RequirePermissions('analytics:nrw')
  async getNrwData(@Query('month') month?: string) {
    let query = `
      SELECT n.*, z.zone_name 
      FROM biz_nrw_report n 
      JOIN dma_zone z ON n.zone_id = z.id 
      WHERE 1=1
    `;
    const params = [];
    if (month) {
      query += ` AND n.report_month = ?`;
      params.push(month);
    }
    query += ` ORDER BY n.report_month DESC, n.nrw_ratio DESC LIMIT 50`;
    return await this.dataSource.query(query, params);
  }
}
