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

  @Post('mnf/deduct')
  @ApiOperation({ summary: '剥离大户夜间合法用水量并重算基线' })
  @RequirePermissions('analytics:mnf')
  async deductMnfKeyAccount(@Body() body: { zoneId: string, deductValue: number }) {
    const targetZoneId = body.zoneId || '201';
    const deductValue = body.deductValue || 4.5;
    
    // 真实工业逻辑：更新 MNF 表的实际观测值，剥离大户消耗
    await this.dataSource.query(
      `UPDATE biz_mnf_analysis 
       SET mnf_value = mnf_value - ?,
           anomaly_score = CASE 
             WHEN (mnf_value - ?) > baseline_value THEN ((mnf_value - ?) - baseline_value) / baseline_value 
             ELSE 0 
           END
       WHERE zone_id = ? AND status = 'anomaly'`,
      [deductValue, deductValue, deductValue, targetZoneId]
    );

    // 重新判定状态
    await this.dataSource.query(
      `UPDATE biz_mnf_analysis 
       SET status = 'normal' 
       WHERE zone_id = ? AND anomaly_score < 0.2`,
      [targetZoneId]
    );

    return { success: true, message: '基线重算完成，异常分数已更新' };
  }
  @ApiOperation({ summary: '获取夜间最小流量 AI 基线与实际值的散点图数据' })
  @RequirePermissions('analytics:mnf')
  async getMnfScatterData(@Query('zoneId') zoneId?: string) {
    const targetZoneId = zoneId || '201'; // 默认张江
    const query = `
      SELECT analysis_date, mnf_value, baseline_value, status 
      FROM biz_mnf_analysis 
      WHERE zone_id = ? 
      ORDER BY analysis_date ASC
      LIMIT 30
    `;
    const rows = await this.dataSource.query(query, [targetZoneId]);
    
    const dates = [];
    const actualPoints = [];
    const baselineLine = [];
    const anomalies = [];

    rows.forEach(row => {
      const dateStr = new Date(row.analysis_date).toISOString().split('T')[0];
      dates.push(dateStr);
      actualPoints.push(row.mnf_value);
      baselineLine.push(row.baseline_value);
      if (row.status === 'anomaly') {
        anomalies.push({
          xAxis: dateStr,
          yAxis: row.mnf_value,
          value: '疑似暗漏'
        });
      }
    });

    return {
      dates,
      actualPoints,
      baselineLine,
      anomalies
    };
  }

  @Get('nrw/sankey')
  @ApiOperation({ summary: '获取产销差桑基图数据流向' })
  @RequirePermissions('analytics:nrw')
  async getNrwSankey(@Query('month') month: string, @Query('zoneId') zoneId: string) {
    if (!month || !zoneId) return { nodes: [], links: [] };
    
    const query = `SELECT * FROM biz_nrw_report WHERE zone_id = ? AND report_month = ? LIMIT 1`;
    const rows = await this.dataSource.query(query, [zoneId, month]);
    if (rows.length === 0) return { nodes: [], links: [] };
    
    const data = rows[0];
    const nodes = [
      { name: '系统总供水' },
      { name: '合法计费用水' },
      { name: '居民用水' },
      { name: '工业用水' },
      { name: '商业用水' },
      { name: '总漏损水量(NRW)' },
      { name: '物理漏损(爆管/渗漏)' },
      { name: '表观漏损(偷水/误差)' }
    ];
    
    const links = [
      { source: '系统总供水', target: '合法计费用水', value: Number(data.consumption_m3) },
      { source: '系统总供水', target: '总漏损水量(NRW)', value: Number(data.nrw_m3) },
      
      { source: '合法计费用水', target: '居民用水', value: Number(data.residential_m3) },
      { source: '合法计费用水', target: '工业用水', value: Number(data.industrial_m3) },
      { source: '合法计费用水', target: '商业用水', value: Number(data.commercial_m3) },
      
      { source: '总漏损水量(NRW)', target: '物理漏损(爆管/渗漏)', value: Number(data.real_loss_m3) },
      { source: '总漏损水量(NRW)', target: '表观漏损(偷水/误差)', value: Number(data.apparent_loss_m3) }
    ];
    
    return { nodes, links };
  }
}
