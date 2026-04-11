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
    const { zoneId, page = 1, size = 20, keyword = '' } = query;
    let sql = `SELECT s.*, z.zone_name FROM ast_site s LEFT JOIN dma_zone z ON s.zone_id = z.id WHERE 1=1`;
    let countSql = `SELECT COUNT(*) as total FROM ast_site s WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (zoneId) {
      sql += ` AND s.zone_id = ?`;
      countSql += ` AND s.zone_id = ?`;
      params.push(zoneId);
      countParams.push(zoneId);
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
    const { siteId, zoneId, page = 1, size = 20, keyword = '' } = query;

    let sql = `SELECT d.*, s.site_name FROM ast_device d LEFT JOIN ast_site s ON d.site_id = s.id `;
    let countSql = `SELECT COUNT(*) as total FROM ast_device d LEFT JOIN ast_site s ON d.site_id = s.id `;
    const params: any[] = [];
    const countParams: any[] = [];

    sql += ` WHERE d.status != 0`;
    countSql += ` WHERE d.status != 0`;

    if (zoneId) {
      sql += ` AND s.zone_id = ?`;
      countSql += ` AND s.zone_id = ?`;
      params.push(zoneId);
      countParams.push(zoneId);
    }

    if (siteId) {
      sql += ` AND d.site_id = ?`;
      countSql += ` AND d.site_id = ?`;
      params.push(siteId);
      countParams.push(siteId);
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
    const { deviceId, page = 1, size = 20, keyword = '' } = query;

    let sql = `
      SELECT p.*, d.device_name, d.device_code 
      FROM ast_measuring_point p
      LEFT JOIN ast_device d ON p.device_id = d.id
      WHERE 1=1
    `;
    let countSql = `SELECT COUNT(*) as total FROM ast_measuring_point p LEFT JOIN ast_device d ON p.device_id = d.id WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (deviceId) {
      sql += ` AND p.device_id = ?`;
      countSql += ` AND p.device_id = ?`;
      params.push(deviceId);
      countParams.push(deviceId);
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

  @Post('site/batch')
  @ApiOperation({ summary: '批量导入物理站点' })
  @RequirePermissions('sys:asset:manage')
  async batchCreateSites(@Body() body: any[]) {
    if (!body || !body.length) return { successCount: 0, errors: [] };
    let successCount = 0;
    const errors = [];
    
    for (const item of body) {
      try {
        const { site_code, site_name, site_type, zone_id, address, lng, lat, crs, properties } = item;
        await this.dataSource.query(
          `INSERT INTO ast_site (site_code, site_name, site_type, zone_id, address, lng, lat, crs, properties) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [site_code || null, site_name || null, site_type || 1, zone_id || null, address || null, lng || null, lat || null, crs || 'CGCS2000', properties ? JSON.stringify(properties) : null]
        );
        successCount++;
      } catch (e) {
        if (errors.length < 5) errors.push(`[${item.site_code || '未知'}]: ${e.message}`);
      }
    }
    return { successCount, errors };
  }

  @Post('site')
  @ApiOperation({ summary: '创建物理站点' })
  @RequirePermissions('sys:asset:manage')
  async createSite(@Body() body: any) {
    const { site_code, site_name, site_type, zone_id, address, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `INSERT INTO ast_site (site_code, site_name, site_type, zone_id, address, lng, lat, crs, properties) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [site_code, site_name, site_type, zone_id || null, address || null, lng || null, lat || null, crs || 'CGCS2000', properties ? JSON.stringify(properties) : null]
    );
    return { success: true };
  }

  @Put('site/:id')
  @ApiOperation({ summary: '更新物理站点' })
  @RequirePermissions('sys:asset:manage')
  async updateSite(@Param('id') id: number, @Body() body: any) {
    const { site_name, site_type, zone_id, address, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `UPDATE ast_site SET site_name=?, site_type=?, zone_id=?, address=?, lng=?, lat=?, crs=?, properties=? WHERE id=?`,
      [site_name, site_type, zone_id || null, address || null, lng || null, lat || null, crs, properties ? JSON.stringify(properties) : null, id]
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

  @Post('site/batch-delete')
  @ApiOperation({ summary: '批量删除物理站点' })
  @RequirePermissions('sys:asset:manage')
  async batchDeleteSites(@Body() body: { ids: number[] }) {
    if (!body.ids || !body.ids.length) return { success: true };
    // 检查是否有挂载设备
    const devices = await this.dataSource.query(`SELECT id FROM ast_device WHERE site_id IN (?)`, [body.ids]);
    if (devices.length > 0) throw new Error('部分站点下存在设备，无法删除');
    await this.dataSource.query(`DELETE FROM ast_site WHERE id IN (?)`, [body.ids]);
    return { success: true };
  }

  // --- Device CRUD ---
  @Post('device/batch')
  @ApiOperation({ summary: '批量导入设备' })
  @RequirePermissions('sys:asset:manage')
  async batchCreateDevices(@Body() body: any[]) {
    if (!body || !body.length) return { successCount: 0, errors: [] };
    let successCount = 0;
    const errors = [];
    
    for (const item of body) {
      try {
        const { device_code, device_name, device_type, site_id, status, manufacturer, model, lng, lat, crs, properties } = item;
        await this.dataSource.query(
          `INSERT INTO ast_device (device_code, device_name, device_type, site_id, status, manufacturer, model, lng, lat, crs, properties) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            device_code || null, 
            device_name || null, 
            device_type || 1, 
            site_id || null, 
            status || 1, 
            manufacturer || null, 
            model || null, 
            lng || null, 
            lat || null, 
            crs || 'CGCS2000', 
            properties ? JSON.stringify(properties) : null
          ]
        );
        successCount++;
      } catch (e) {
        if (errors.length < 5) errors.push(`[${item.device_code || '未知'}]: ${e.message}`);
      }
    }
    return { successCount, errors };
  }

  @Post('device')
  @ApiOperation({ summary: '创建设备' })
  @RequirePermissions('sys:asset:manage')
  async createDevice(@Body() body: any) {
    const { device_code, device_name, device_type, site_id, status, manufacturer, model, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `INSERT INTO ast_device (device_code, device_name, device_type, site_id, status, manufacturer, model, lng, lat, crs, properties) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_code, device_name, device_type, site_id || null, status || 1, manufacturer || null, model || null, lng || null, lat || null, crs || 'CGCS2000', properties ? JSON.stringify(properties) : null]
    );
    return { success: true };
  }

  @Put('device/:id')
  @ApiOperation({ summary: '更新设备' })
  @RequirePermissions('sys:asset:manage')
  async updateDevice(@Param('id') id: number, @Body() body: any) {
    const { device_name, device_type, site_id, status, manufacturer, model, lng, lat, crs, properties } = body;
    await this.dataSource.query(
      `UPDATE ast_device 
       SET device_name=?, device_type=?, site_id=?, status=?, manufacturer=?, model=?, lng=?, lat=?, crs=?, properties=? 
       WHERE id=?`,
      [device_name, device_type, site_id || null, status, manufacturer || null, model || null, lng || null, lat || null, crs, properties ? JSON.stringify(properties) : null, id]
    );
    return { success: true };
  }

  @Delete('device/:id')
  @ApiOperation({ summary: '删除设备' })
  @RequirePermissions('sys:asset:manage')
  async deleteDevice(@Param('id') id: number) {
    const points = await this.dataSource.query(`SELECT id FROM ast_measuring_point WHERE device_id = ?`, [id]);
    if (points.length > 0) throw new Error('该设备下存在测点，无法删除');
    await this.dataSource.query(`DELETE FROM ast_device WHERE id = ?`, [id]);
    return { success: true };
  }

  @Post('device/batch-delete')
  @ApiOperation({ summary: '批量删除设备' })
  @RequirePermissions('sys:asset:manage')
  async batchDeleteDevices(@Body() body: { ids: number[] }) {
    if (!body.ids || !body.ids.length) return { success: true };
    const points = await this.dataSource.query(`SELECT id FROM ast_measuring_point WHERE device_id IN (?)`, [body.ids]);
    if (points.length > 0) throw new Error('部分设备下存在测点，无法删除');
    await this.dataSource.query(`DELETE FROM ast_device WHERE id IN (?)`, [body.ids]);
    return { success: true };
  }

  // --- Point CRUD ---
  @Post('point/batch')
  @ApiOperation({ summary: '批量导入物理测点' })
  @RequirePermissions('sys:asset:manage')
  async batchCreatePoints(@Body() body: any[]) {
    if (!body || !body.length) return { successCount: 0, errors: [] };
    let successCount = 0;
    const errors = [];
    
    for (const item of body) {
      try {
        const { device_id, point_code, point_name, point_category, data_type, unit, range_min, range_max, properties } = item;
        await this.dataSource.query(
          `INSERT INTO ast_measuring_point (device_id, point_code, point_name, point_category, data_type, unit, range_min, range_max, properties) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            device_id || null, 
            point_code || null, 
            point_name || null, 
            point_category || 1, 
            data_type || 'float', 
            unit || '', 
            range_min || null, 
            range_max || null, 
            properties ? JSON.stringify(properties) : null
          ]
        );
        successCount++;
      } catch (e) {
        if (errors.length < 5) errors.push(`[${item.point_code || '未知'}]: ${e.message}`);
      }
    }
    return { successCount, errors };
  }

  @Post('point')
  @ApiOperation({ summary: '创建物理测点' })
  @RequirePermissions('sys:asset:manage')
  async createPoint(@Body() body: any) {
    const { device_id, point_code, point_name, point_category, data_type, unit, range_min, range_max, properties } = body;
    await this.dataSource.query(
      `INSERT INTO ast_measuring_point (device_id, point_code, point_name, point_category, data_type, unit, range_min, range_max, properties) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [device_id, point_code, point_name, point_category, data_type || 'float', unit || '', range_min || null, range_max || null, properties ? JSON.stringify(properties) : null]
    );
    return { success: true };
  }

  @Put('point/:id')
  @ApiOperation({ summary: '修改物理测点' })
  @RequirePermissions('sys:asset:manage')
  async updatePoint(@Param('id') id: number, @Body() body: any) {
    const { device_id, point_name, point_category, data_type, unit, range_min, range_max, properties } = body;
    await this.dataSource.query(
      `UPDATE ast_measuring_point 
       SET device_id=?, point_name=?, point_category=?, data_type=?, unit=?, range_min=?, range_max=?, properties=? 
       WHERE id=?`,
      [device_id, point_name, point_category, data_type || 'float', unit || '', range_min || null, range_max || null, properties ? JSON.stringify(properties) : null, id]
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
