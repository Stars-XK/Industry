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
  @ApiOperation({ summary: '获取DMA分区与站点树' })
  async getZoneTree(@Request() req: any) {
    const userId = req.user?.userId;
    
    // 构建查询条件，基于当前登录用户进行权限过滤 (超级管理员 userId=1 查看全部)
    const whereCondition: any = { is_deleted: null };
    if (userId && userId !== 1) {
      whereCondition.created_by = userId;
    }

    // 1. 获取带有权限过滤的 DMA 分区
    const zones = await this.dmaZoneRepo.find({ 
      where: whereCondition,
      order: { id: 'ASC' }
    });

    // 2. 获取物理站点
    const sites = await this.dataSource.query(`SELECT id, site_name as label, site_type, zone_id FROM ast_site`);

    // 3. 统计设备数量
    const siteDeviceCounts = await this.dataSource.query(`
      SELECT site_id, COUNT(id) as cnt
      FROM ast_device
      WHERE status != 0
      GROUP BY site_id
    `);
    const countMap = new Map();
    siteDeviceCounts.forEach((r: any) => countMap.set(r.site_id, Number(r.cnt)));

    const tree = [];
    const zoneMap = new Map();

    // 4. 转换为树节点格式
    zones.forEach((z: any) => {
      const node = { 
        id: `zone_${z.id}`, 
        realId: z.id, 
        label: z.zone_name, 
        level: 'zone', 
        children: [] 
      };
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

      // 挂载到对应的父分区节点
      if (s.zone_id && zoneMap.has(s.zone_id)) {
        zoneMap.get(s.zone_id).children.push(node);
      }
    });

    // 5. 组装分区层级
    zones.forEach((z: any) => {
      const parentId = Number(z.parent_id);
      if (parentId && zoneMap.has(parentId)) {
        zoneMap.get(parentId).children.push(zoneMap.get(z.id));
      } else {
        // 没有 parent_id 或找不到 parent_id 的作为顶层分区
        tree.push(zoneMap.get(z.id));
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
