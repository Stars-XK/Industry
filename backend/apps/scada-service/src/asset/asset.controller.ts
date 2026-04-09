import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { AstDevice } from '../../../../libs/entities/src/ast-device.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('全域物理资产与设备台账')
@ApiBearerAuth()
@Controller('system/asset')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AssetController {
  constructor(
    @InjectRepository(AstDevice)
    private readonly deviceRepo: Repository<AstDevice>,
    private dataSource: DataSource
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取物理站点与组织架构树' })
  async getAssetTree() {
    // 1. 获取部门作为最顶层
    const depts = await this.dataSource.query(`SELECT id, parent_id, dept_name as label FROM sys_dept WHERE status = 1 ORDER BY sort_order ASC`);
    
    // 2. 获取DMA分区
    const zones = await this.dataSource.query(`SELECT id, parent_id, zone_name as label FROM dma_zone`);

    // 3. 获取物理站点
    const sites = await this.dataSource.query(`SELECT id, site_name as label, site_type, zone_id, dept_id FROM ast_site`);

    // 4. 统计设备数量
    const siteDeviceCounts = await this.dataSource.query(`
      SELECT site_id, COUNT(id) as cnt 
      FROM ast_device 
      WHERE status != 0 
      GROUP BY site_id
    `);
    const countMap = new Map();
    siteDeviceCounts.forEach((r: any) => countMap.set(r.site_id, Number(r.cnt)));

    // 构建树形逻辑 (部门 -> 分区 -> 站点)
    // 简化处理：由于这里需要拼装多张表，直接返回平铺数据，前端拼装，或者后端拼装
    // 这里采用后端拼装
    
    const tree = [];
    const deptMap = new Map();
    const zoneMap = new Map();

    depts.forEach((d: any) => {
      const node = { id: `dept_${d.id}`, realId: d.id, label: d.label, level: 'org', children: [] };
      deptMap.set(d.id, node);
    });

    zones.forEach((z: any) => {
      const node = { id: `zone_${z.id}`, realId: z.id, label: z.label, level: 'zone', children: [] };
      zoneMap.set(z.id, node);
    });

    sites.forEach((s: any) => {
      const node = { 
        id: `site_${s.id}`, 
        realId: s.id, 
        label: s.label, 
        level: 'site', 
        type: s.site_type,
        deviceCount: countMap.get(s.id) || 0 
      };
      
      // 挂载到对应的父节点
      if (s.zone_id && zoneMap.has(s.zone_id)) {
        zoneMap.get(s.zone_id).children.push(node);
      } else if (s.dept_id && deptMap.has(s.dept_id)) {
        deptMap.get(s.dept_id).children.push(node);
      }
    });

    // 组装分区到部门，由于需求没有写死分区一定在哪个部门下，这里假设分区挂载在根节点或其他
    zones.forEach((z: any) => {
      // 简单处理：没有 parent_id 的挂到顶级
      if (z.parent_id && zoneMap.has(z.parent_id)) {
        zoneMap.get(z.parent_id).children.push(zoneMap.get(z.id));
      } else {
        // 挂载到默认部门或者顶级
        if (deptMap.has(1)) {
          deptMap.get(1).children.push(zoneMap.get(z.id));
        } else {
          tree.push(zoneMap.get(z.id));
        }
      }
    });

    depts.forEach((d: any) => {
      if (d.parent_id && deptMap.has(d.parent_id)) {
        deptMap.get(d.parent_id).children.push(deptMap.get(d.id));
      } else {
        tree.push(deptMap.get(d.id));
      }
    });

    return tree;
  }

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
