import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { DmaZone } from '../../../../libs/entities/src/dma-zone.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('DMA 拓扑导航与分区配置')
@ApiBearerAuth()
@Controller('scada/topology')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TopologyController {
  constructor(
    @InjectRepository(DmaZone)
    private readonly dmaZoneRepo: Repository<DmaZone>,
    private dataSource: DataSource
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取 DMA 拓扑树(带报警状态)' })
  async getTopologyTree() {
    const zones = await this.dmaZoneRepo.find({
      select: ['id', 'parent_code', 'zone_code', 'zone_name', 'level', 'mnf_baseline'],
      where: { is_deleted: null },
      order: { id: 'ASC' }
    });

    let alarmZoneIds: number[] = [];
    try {
      const now = Date.now() - 300000;
      // 关联 ast_site 和 ast_device 查出设备所在分区
      const query = `
        SELECT DISTINCT s.zone_code
        FROM device_raw r
        JOIN ast_device d ON r.device_code = d.device_code
        JOIN ast_site s ON d.site_code = s.site_code
        WHERE r.timestamp >= ? AND (
          (r.standard_name = 'pressure' AND r.value < 0.3) OR
          (r.standard_name = 'h2s' AND r.value >= 10.0)
        ) AND s.zone_code IS NOT NULL
      `;
      const res = await this.dataSource.query(query, [now]);
      if (res && res.length > 0) {
        const alarmCodes = res.map((row: any) => row.zone_code);
        alarmZoneIds = zones.filter(z => alarmCodes.includes(z.zone_code)).map(z => z.id);
      }
    } catch (e) {
      console.error('Failed to query real alarms', e);
    }

    return this.buildTree(zones, alarmZoneIds);
  }

  @Post('zone')
  @ApiOperation({ summary: '新增 DMA 分区' })
  @RequirePermissions('scada:dma:manage')
  async createZone(@Body() body: any, @Request() req: any) {
    const { parent_code, zone_code, zone_name, level, boundary_gis, mnf_baseline } = body;
    const newZone = this.dmaZoneRepo.create({
      parent_code: parent_code || null,
      zone_code: zone_code || null,
      zone_name,
      level: level || 1,
      boundary_gis,
      mnf_baseline: mnf_baseline || 0,
      created_by: req.user.userId
    });
    await this.dmaZoneRepo.save(newZone);
    return { success: true };
  }

  @Put('zone/:id')
  @ApiOperation({ summary: '修改 DMA 分区' })
  @RequirePermissions('scada:dma:manage')
  async updateZone(@Param('id') id: number, @Body() body: any, @Request() req: any) {
    const { parent_code, zone_code, zone_name, level, boundary_gis, mnf_baseline } = body;
    await this.dmaZoneRepo.update(id, {
      parent_code,
      zone_code,
      zone_name,
      level,
      boundary_gis,
      mnf_baseline,
      updated_by: req.user.userId
    });
    return { success: true };
  }

  @Delete('zone/:id')
  @ApiOperation({ summary: '删除 DMA 分区' })
  @RequirePermissions('scada:dma:manage')
  async deleteZone(@Param('id') id: number) {
    const zone = await this.dmaZoneRepo.findOne({ where: { id } });
    if (!zone) throw new Error('分区不存在');
    if (zone.zone_code) {
      const children = await this.dmaZoneRepo.count({ where: { parent_code: zone.zone_code, is_deleted: null } });
      if (children > 0) throw new Error('该分区下存在子分区，禁止删除');
      
      const sites = await this.dataSource.query(`SELECT id FROM ast_site WHERE zone_code = ?`, [zone.zone_code]);
      if (sites.length > 0) throw new Error('该分区已挂载物理站点，请先解绑后再删除');
    }
    
    await this.dmaZoneRepo.update(id, { is_deleted: new Date() });
    return { success: true };
  }

  @Get('devices/:zoneId')
  @ApiOperation({ summary: '获取分区下挂载的设备' })
  async getZoneDevices(@Param('zoneId') zoneId: number) {
    const query = `
      SELECT r.id as rel_id, a.id as device_id, a.device_code, a.device_name, a.device_type, r.direction
      FROM dma_device_rel r
      JOIN ast_device a ON r.device_id = a.id
      WHERE r.zone_id = ? AND a.status = 1
    `;
    const devices = await this.dataSource.query(query, [zoneId]);

    return devices.map(d => ({
      rel_id: d.rel_id,
      device_id: d.device_id,
      device_code: d.device_code,
      name: d.device_name,
      type_code: d.device_type,
      type_name: this.getDeviceTypeName(d.device_type),
      direction: d.direction,
      direction_name: d.direction === 1 ? '进水分表' : (d.direction === -1 ? '出水分表' : '内部分表')
    }));
  }

  @Post('devices/:zoneId/bind')
  @ApiOperation({ summary: '为分区挂载新设备' })
  @RequirePermissions('scada:dma:manage')
  async bindDevice(@Param('zoneId') zoneId: number, @Body() body: { device_id: number, direction: number }) {
    // 检查设备是否已被该分区绑定
    const exist = await this.dataSource.query(`SELECT id FROM dma_device_rel WHERE zone_id = ? AND device_id = ?`, [zoneId, body.device_id]);
    if (exist.length > 0) throw new Error('该设备已经挂载到此分区');

    await this.dataSource.query(
      `INSERT INTO dma_device_rel (zone_id, device_id, direction) VALUES (?, ?, ?)`,
      [zoneId, body.device_id, body.direction]
    );
    return { success: true };
  }

  @Delete('devices/unbind/:relId')
  @ApiOperation({ summary: '解除设备的挂载关系' })
  @RequirePermissions('scada:dma:manage')
  async unbindDevice(@Param('relId') relId: number) {
    await this.dataSource.query(`DELETE FROM dma_device_rel WHERE id = ?`, [relId]);
    return { success: true };
  }

  @Get('assets/available')
  @ApiOperation({ summary: '获取可供挂载的所有物理资产' })
  @RequirePermissions('scada:dma:manage')
  async getAvailableAssets() {
    const query = `SELECT id, device_code, device_name, device_type FROM ast_device WHERE status = 1 ORDER BY id DESC LIMIT 500`;
    const devices = await this.dataSource.query(query);
    return devices.map(d => ({
      ...d,
      type_name: this.getDeviceTypeName(d.device_type)
    }));
  }

  private getDeviceTypeName(type: number): string {
    switch(type) {
      case 1: return '流量计';
      case 2: return '压力表';
      case 3: return '水质分析仪';
      case 4: return '泵站组';
      case 5: return '环境传感器';
      default: return '未知设备';
    }
  }

  private buildTree(zones: DmaZone[], alarmZoneIds: number[]): any[] {
    const tree = [];
    const zoneMap = new Map();

    zones.forEach((zone) => {
      zoneMap.set(zone.zone_code, {
        id: zone.id,
        zoneCode: zone.zone_code,
        label: zone.zone_name,
        level: zone.level,
        status: alarmZoneIds.includes(zone.id) ? 'alarm' : 'normal',
        mnf_baseline: zone.mnf_baseline,
        children: []
      });
    });

    zones.forEach((zone) => {
      const parentCode = zone.parent_code;
      if (parentCode && zoneMap.has(parentCode)) {
        zoneMap.get(parentCode).children.push(zoneMap.get(zone.zone_code));
      } else {
        tree.push(zoneMap.get(zone.zone_code));
      }
    });

    return tree;
  }
}
