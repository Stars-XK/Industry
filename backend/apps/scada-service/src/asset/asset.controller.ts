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

  @Get('sites')
  @ApiOperation({ summary: '分页获取分区下的物理站点列表' })
  async getSites(@Query() query: any) {
    const { zoneCode, page = 1, size = 20, keyword = '' } = query;
    let sql = `SELECT s.*, z.zone_name FROM ast_site s LEFT JOIN dma_zone z ON s.zone_code = z.zone_code WHERE 1=1`;
    let countSql = `SELECT COUNT(*) as total FROM ast_site s WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (zoneCode) {
      sql += ` AND s.zone_code = ?`;
      countSql += ` AND s.zone_code = ?`;
      params.push(zoneCode);
      countParams.push(zoneCode);
    }

    if (keyword) {
      sql += ` AND (s.site_name LIKE ? OR s.site_code LIKE ?)`;
      countSql += ` AND (s.site_name LIKE ? OR s.site_code LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY s.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(size), (Number(page) - 1) * Number(size));

    const list = await this.dataSource.query(sql, params);
    const countRes = await this.dataSource.query(countSql, countParams);

    return {
      list,
      total: Number(countRes[0].total)
    };
  }

  @Get('devices')
  @ApiOperation({ summary: '分页获取分区或站点下的设备列表' })
  async getDevices(@Query() query: any) {
    const { siteCode, zoneCode, page = 1, size = 20, keyword = '' } = query;

    let sql = `SELECT d.*, s.site_name FROM ast_device d LEFT JOIN ast_site s ON d.site_code = s.site_code `;
    let countSql = `SELECT COUNT(*) as total FROM ast_device d LEFT JOIN ast_site s ON d.site_code = s.site_code `;
    const params: any[] = [];
    const countParams: any[] = [];

    sql += ` WHERE d.status != 0`;
    countSql += ` WHERE d.status != 0`;

    if (zoneCode) {
      sql += ` AND s.zone_code = ?`;
      countSql += ` AND s.zone_code = ?`;
      params.push(zoneCode);
      countParams.push(zoneCode);
    }

    if (siteCode) {
      sql += ` AND d.site_code = ?`;
      countSql += ` AND d.site_code = ?`;
      params.push(siteCode);
      countParams.push(siteCode);
    }
    
    if (keyword) {
      sql += ` AND (d.device_name LIKE ? OR d.device_code LIKE ?)`;
      countSql += ` AND (d.device_name LIKE ? OR d.device_code LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY d.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(size), (Number(page) - 1) * Number(size));

    const list = await this.dataSource.query(sql, params);
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

  @Get('points')
  @ApiOperation({ summary: '分页获取测点字典列表' })
  async getPoints(@Query() query: any) {
    const { deviceCode, page = 1, size = 20, keyword = '' } = query;

    let sql = `
      SELECT p.*, d.device_name, d.device_code as mapped_device_code
      FROM ast_measuring_point p
      LEFT JOIN ast_device d ON p.device_code = d.device_code
      WHERE 1=1
    `;
    let countSql = `SELECT COUNT(*) as total FROM ast_measuring_point p LEFT JOIN ast_device d ON p.device_code = d.device_code WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (deviceCode) {
      sql += ` AND p.device_code = ?`;
      countSql += ` AND p.device_code = ?`;
      params.push(deviceCode);
      countParams.push(deviceCode);
    }

    if (keyword) {
      sql += ` AND (p.point_name LIKE ? OR p.point_code LIKE ?)`;
      countSql += ` AND (p.point_name LIKE ? OR p.point_code LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(size), (Number(page) - 1) * Number(size));

    const list = await this.dataSource.query(sql, params);
    const countRes = await this.dataSource.query(countSql, countParams);

    return {
      list,
      total: Number(countRes[0].total)
    };
  }

  @Post('site')
  @ApiOperation({ summary: '创建物理站点' })
  @RequirePermissions('sys:asset:manage')
  async createSite(@Body() body: any) {
    const { site_code, site_name, site_type, zone_code, address, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `INSERT INTO ast_site (site_code, site_name, site_type, zone_code, address, lng, lat, crs, properties) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_code, site_name, site_type, zone_code || null, address || null, lng || null, lat || null, crs || 'CGCS2000', properties ? JSON.stringify(properties) : null]
    );
    return { success: true };
  }

  @Put('site/:id')
  @ApiOperation({ summary: '更新物理站点' })
  @RequirePermissions('sys:asset:manage')
  async updateSite(@Param('id') id: number, @Body() body: any) {
    const { site_name, site_type, zone_code, address, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `UPDATE ast_site SET site_name=?, site_type=?, zone_code=?, address=?, lng=?, lat=?, crs=?, properties=? WHERE id=?`,
      [site_name, site_type, zone_code || null, address || null, lng || null, lat || null, crs, properties ? JSON.stringify(properties) : null, id]
    );
    return { success: true };
  }

  @Delete('site/:id')
  @ApiOperation({ summary: '删除物理站点' })
  @RequirePermissions('sys:asset:manage')
  async deleteSite(@Param('id') id: number) {
    const site = await this.dataSource.query(`SELECT site_code FROM ast_site WHERE id = ?`, [id]);
    if (!site || site.length === 0) throw new Error('站点不存在');
    if (site[0].site_code) {
      const devices = await this.dataSource.query(`SELECT id FROM ast_device WHERE site_code = ?`, [site[0].site_code]);
      if (devices.length > 0) throw new Error('该站点下存在设备，无法删除');
    }
    await this.dataSource.query(`DELETE FROM ast_site WHERE id = ?`, [id]);
    return { success: true };
  }

  @Post('site/batch-delete')
  @ApiOperation({ summary: '批量删除物理站点' })
  @RequirePermissions('sys:asset:manage')
  async batchDeleteSites(@Body() body: { ids: number[] }) {
    if (!body.ids || !body.ids.length) return { success: true };
    const sites = await this.dataSource.query(`SELECT site_code FROM ast_site WHERE id IN (?)`, [body.ids]);
    const codes = sites.map((s: any) => s.site_code).filter((c: any) => !!c);
    
    if (codes.length > 0) {
      const devices = await this.dataSource.query(`SELECT id FROM ast_device WHERE site_code IN (?)`, [codes]);
      if (devices.length > 0) throw new Error('部分站点下存在设备，无法删除');
    }
    await this.dataSource.query(`DELETE FROM ast_site WHERE id IN (?)`, [body.ids]);
    return { success: true };
  }

  // --- Device CRUD ---
  @Post('device')
  @ApiOperation({ summary: '创建设备' })
  @RequirePermissions('sys:asset:manage')
  async createDevice(@Body() body: any) {
    const { device_code, device_name, device_type, site_code, status, manufacturer, model, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `INSERT INTO ast_device (device_code, device_name, device_type, site_code, status, manufacturer, model, lng, lat, crs, properties)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_code, device_name, device_type, site_code || null, status || 1, manufacturer || null, model || null, lng || null, lat || null, crs || 'CGCS2000', properties ? JSON.stringify(properties) : null]
    );
    return { success: true };
  }

  @Put('device/:id')
  @ApiOperation({ summary: '更新设备' })
  @RequirePermissions('sys:asset:manage')
  async updateDevice(@Param('id') id: number, @Body() body: any) {
    const { device_name, device_type, site_code, status, manufacturer, model, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `UPDATE ast_device
       SET device_name=?, device_type=?, site_code=?, status=?, manufacturer=?, model=?, lng=?, lat=?, crs=?, properties=?
       WHERE id=?`,
      [device_name, device_type, site_code || null, status, manufacturer || null, model || null, lng || null, lat || null, crs, properties ? JSON.stringify(properties) : null, id]
    );
    return { success: true };
  }

  @Delete('device/:id')
  @ApiOperation({ summary: '删除设备' })
  @RequirePermissions('sys:asset:manage')
  async deleteDevice(@Param('id') id: number) {
    const device = await this.dataSource.query(`SELECT device_code FROM ast_device WHERE id = ?`, [id]);
    if (!device || device.length === 0) throw new Error('设备不存在');
    if (device[0].device_code) {
      const points = await this.dataSource.query(`SELECT id FROM ast_measuring_point WHERE device_code = ?`, [device[0].device_code]);
      if (points.length > 0) throw new Error('该设备下存在测点，无法删除');
    }
    await this.dataSource.query(`DELETE FROM ast_device WHERE id = ?`, [id]);
    return { success: true };
  }

  @Post('device/batch-delete')
  @ApiOperation({ summary: '批量删除设备' })
  @RequirePermissions('sys:asset:manage')
  async batchDeleteDevices(@Body() body: { ids: number[] }) {
    if (!body.ids || !body.ids.length) return { success: true };
    const devices = await this.dataSource.query(`SELECT device_code FROM ast_device WHERE id IN (?)`, [body.ids]);
    const codes = devices.map((d: any) => d.device_code).filter((c: any) => !!c);
    
    if (codes.length > 0) {
      const points = await this.dataSource.query(`SELECT id FROM ast_measuring_point WHERE device_code IN (?)`, [codes]);
      if (points.length > 0) throw new Error('部分设备下存在测点，无法删除');
    }
    await this.dataSource.query(`DELETE FROM ast_device WHERE id IN (?)`, [body.ids]);
    return { success: true };
  }

  // --- Point CRUD ---
  @Post('point')
  @ApiOperation({ summary: '创建物理测点' })
  @RequirePermissions('sys:asset:manage')
  async createPoint(@Body() body: any) {
    const { device_code, point_code, point_name, point_category, data_type, unit, range_min, range_max, properties } = body;
    await this.dataSource.query(
      `INSERT INTO ast_measuring_point (device_code, point_code, point_name, point_category, data_type, unit, range_min, range_max, properties)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_code || null, point_code, point_name, point_category, data_type || 'float', unit || '', range_min || null, range_max || null, properties ? JSON.stringify(properties) : null]
    );
    return { success: true };
  }

  @Put('point/:id')
  @ApiOperation({ summary: '修改物理测点' })
  @RequirePermissions('sys:asset:manage')
  async updatePoint(@Param('id') id: number, @Body() body: any) {
    const { device_code, point_name, point_category, data_type, unit, range_min, range_max, properties } = body;
    await this.dataSource.query(
      `UPDATE ast_measuring_point
       SET device_code=?, point_name=?, point_category=?, data_type=?, unit=?, range_min=?, range_max=?, properties=?
       WHERE id=?`,
      [device_code || null, point_name, point_category, data_type || 'float', unit || '', range_min || null, range_max || null, properties ? JSON.stringify(properties) : null, id]
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

  @Post('point/batch-delete')
  @ApiOperation({ summary: '批量删除物理测点' })
  @RequirePermissions('sys:asset:manage')
  async batchDeletePoints(@Body() body: { ids: number[] }) {
    if (!body.ids || !body.ids.length) return { success: true };
    await this.dataSource.query(`DELETE FROM ast_measuring_point WHERE id IN (?)`, [body.ids]);
    return { success: true };
  }
}
