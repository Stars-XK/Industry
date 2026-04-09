import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { AstDevice } from '../../../../libs/entities/src/ast-device.entity';
import { DmaZone } from '../../../../libs/entities/src/dma-zone.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('全域物理资产与设备台账')
@ApiBearerAuth()
@Controller('system/asset')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssetController {
  constructor(
    @InjectRepository(AstDevice)
    private readonly deviceRepo: Repository<AstDevice>,
    @InjectRepository(DmaZone)
    private readonly dmaZoneRepo: Repository<DmaZone>,
    private dataSource: DataSource
  ) {}

  @Get('devices')
  @ApiOperation({ summary: '分页获取站点下的设备列表' })
  async getDevices(@Query() query: any) {
    const { siteId, page = 1, size = 20, keyword = '' } = query;
    let sql = `SELECT * FROM ast_device WHERE status != 0`;
    const params: any[] = [];

    if (siteId) {
      sql += ` AND site_id = ?`;
      params.push(siteId);
    }
    if (keyword) {
      sql += ` AND (device_name LIKE ? OR device_code LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(Number(size), (Number(page) - 1) * Number(size));

    const list = await this.dataSource.query(sql, params);

    // 统计总数
    let countSql = `SELECT COUNT(*) as total FROM ast_device WHERE status != 0`;
    const countParams: any[] = [];
    if (siteId) { countSql += ` AND site_id = ?`; countParams.push(siteId); }
    if (keyword) { countSql += ` AND (device_name LIKE ? OR device_code LIKE ?)`; countParams.push(`%${keyword}%`, `%${keyword}%`); }
    
    const countRes = await this.dataSource.query(countSql, countParams);
    
    // 获取每个设备的测点
    for (const dev of list) {
      dev.points = await this.dataSource.query(
        `SELECT id, point_code, point_name, point_category, data_type, unit FROM ast_measuring_point WHERE device_id = ?`,
        [dev.id]
      );
    }

    return {
      list,
      total: Number(countRes[0].total)
    };
  }

  @Post('site')
  @ApiOperation({ summary: '创建物理站点' })
  @RequirePermissions('sys:asset:manage')
  async createSite(@Body() body: any) {
    const { site_code, site_name, site_type, zone_id, dept_id } = body;
    await this.dataSource.query(
      `INSERT INTO ast_site (site_code, site_name, site_type, zone_id, dept_id) VALUES (?, ?, ?, ?, ?)`,
      [site_code, site_name, site_type, zone_id || null, dept_id || null]
    );
    return { success: true };
  }

  @Put('site/:id')
  @ApiOperation({ summary: '更新物理站点' })
  @RequirePermissions('sys:asset:manage')
  async updateSite(@Param('id') id: number, @Body() body: any) {
    const { site_name, site_type, zone_id, dept_id } = body;
    await this.dataSource.query(
      `UPDATE ast_site SET site_name=?, site_type=?, zone_id=?, dept_id=? WHERE id=?`,
      [site_name, site_type, zone_id || null, dept_id || null, id]
    );
    return { success: true };
  }

  @Delete('site/:id')
  @ApiOperation({ summary: '删除物理站点' })
  @RequirePermissions('sys:asset:manage')
  async deleteSite(@Param('id') id: number) {
    const devices = await this.dataSource.query(`SELECT id FROM ast_device WHERE site_id = ?`, [id]);
    if (devices.length > 0) throw new Error('该站点下存在设备，无法删除');
    await this.dataSource.query(`DELETE FROM ast_site WHERE id = ?`, [id]);
    return { success: true };
  }

  @Post('point')
  @ApiOperation({ summary: '为设备添加物理测点' })
  @RequirePermissions('sys:asset:manage')
  async createPoint(@Body() body: any) {
    const { device_id, point_code, point_name, point_category, data_type, unit } = body;
    await this.dataSource.query(
      `INSERT INTO ast_measuring_point (device_id, point_code, point_name, point_category, data_type, unit) VALUES (?, ?, ?, ?, ?, ?)`,
      [device_id, point_code, point_name, point_category, data_type || 'float', unit || '']
    );
    return { success: true };
  }

  @Delete('point/:id')
  @ApiOperation({ summary: '删除物理测点' })
  @RequirePermissions('sys:asset:manage')
  async deletePoint(@Param('id') id: number) {
    await this.dataSource.query(`DELETE FROM ast_measuring_point WHERE id = ?`, [id]);
    return { success: true };
  }
}
