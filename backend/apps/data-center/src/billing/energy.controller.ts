import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('综合能效管理')
@ApiBearerAuth()
@Controller('data-center/energy')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class EnergyController {
  constructor(private dataSource: DataSource) {}

  @Get('list')
  @ApiOperation({ summary: '获取能效记录与千吨水百米扬程指标' })
  @RequirePermissions('analytics:energy')
  async getRecords() {
    const query = `
      SELECT e.*, d.device_name, d.device_code
      FROM biz_energy_record e
      JOIN ast_device d ON e.device_code = d.device_code
      ORDER BY e.record_date DESC LIMIT 500
    `;
    return await this.dataSource.query(query);
  }

  @Post('record')
  @ApiOperation({ summary: '手工补录能效数据' })
  @RequirePermissions('analytics:energy')
  async createRecord(@Body() body: any) {
    const { device_code, record_date, power_kwh, water_pumped_m3 } = body;
    // 公式: 吨水百米能耗 = (耗电量 / 水量) * (100 / 扬程参考常数)
    // 简化: (power_kwh / water_pumped_m3) * 10
    const eff = water_pumped_m3 > 0 ? (power_kwh / water_pumped_m3) * 10 : 0;

    await this.dataSource.query(
      `INSERT INTO biz_energy_record (device_code, record_date, power_kwh, water_pumped_m3, energy_efficiency) VALUES (?, ?, ?, ?, ?)`,
      [device_code, record_date, power_kwh, water_pumped_m3, eff]
    );
    return { success: true };
  }

  @Delete('record/:id')
  @ApiOperation({ summary: '删除能效记录' })
  @RequirePermissions('analytics:energy')
  async deleteRecord(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM biz_energy_record WHERE id = ?`, [id]);
    return { success: true };
  }
}
