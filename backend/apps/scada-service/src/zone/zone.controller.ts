import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { DmaZone } from '../../../../libs/entities/src/dma-zone.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('DMA 分区管理')
@ApiBearerAuth()
@Controller('system/zone')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ZoneController {
  constructor(
    @InjectRepository(DmaZone)
    private readonly dmaZoneRepo: Repository<DmaZone>,
    private dataSource: DataSource
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取物理站点与组织架构、DMA分区的聚合树' })
  async getZoneTree() {
    // 1. 获取部门作为最顶层
    const depts = await this.dataSource.query(`SELECT id, parent_id, dept_name as label FROM sys_dept WHERE status = 1 ORDER BY sort_order ASC`);
    
    // 2. 获取DMA分区 (使用 DmaZone 实体)
    const zones = await this.dmaZoneRepo.find({ where: { is_deleted: null } });

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
    const tree = [];
    const deptMap = new Map();
    const zoneMap = new Map();

    depts.forEach((d: any) => {
      const node = { id: `dept_${d.id}`, realId: d.id, label: d.label, level: 'org', children: [] };
      deptMap.set(d.id, node);
    });

    zones.forEach((z: any) => {
      const node = { id: `zone_${z.id}`, realId: z.id, label: z.zone_name, level: 'zone', children: [] };
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

    // 组装分区到部门
    zones.forEach((z: any) => {
      if (z.parent_id && zoneMap.has(z.parent_id)) {
        zoneMap.get(z.parent_id).children.push(zoneMap.get(z.id));
      } else {
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

  @Post()
  @ApiOperation({ summary: '新增 DMA 分区' })
  @RequirePermissions('sys:asset:manage')
  async createZone(@Body() body: any, @Request() req: any) {
    const { parent_id, zone_name, level, boundary_gis, mnf_baseline } = body;
    const newZone = this.dmaZoneRepo.create({
      parent_id: parent_id || 0,
      zone_name,
      level: level || 1,
      boundary_gis,
      mnf_baseline: mnf_baseline || 0,
      created_by: req.user?.userId || 1
    });
    await this.dmaZoneRepo.save(newZone);
    return { success: true };
  }

  @Put(':id')
  @ApiOperation({ summary: '修改 DMA 分区' })
  @RequirePermissions('sys:asset:manage')
  async updateZone(@Param('id') id: number, @Body() body: any, @Request() req: any) {
    const { parent_id, zone_name, level, boundary_gis, mnf_baseline } = body;
    await this.dmaZoneRepo.update(id, {
      parent_id,
      zone_name,
      level,
      boundary_gis,
      mnf_baseline,
      updated_by: req.user?.userId || 1
    });
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 DMA 分区' })
  @RequirePermissions('sys:asset:manage')
  async deleteZone(@Param('id') id: number) {
    const children = await this.dmaZoneRepo.count({ where: { parent_id: id, is_deleted: null } });
    if (children > 0) throw new Error('该分区下存在子分区，禁止删除');

    await this.dmaZoneRepo.update(id, { is_deleted: new Date() });
    return { success: true };
  }
}
