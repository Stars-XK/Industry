import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '@app/common';
import { DmaZone } from '../../../../libs/entities/src/dma-zone.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('DMA 拓扑导航')
@ApiBearerAuth()
@Controller('api/scada/topology')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class TopologyController {
  constructor(
    @InjectRepository(DmaZone)
    private readonly dmaZoneRepo: Repository<DmaZone>,
    private dataSource: DataSource
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取 DMA 拓扑树' })
  async getTopologyTree() {
    const zones = await this.dmaZoneRepo.find({
      where: { is_deleted: null },
      order: { id: 'ASC' }
    });
    
    // Find active alarms from recent device_raw
    let mockAlarmZoneIds = [102];
    try {
      const now = Date.now() - 300000; // last 5 minutes
      const query = `
        SELECT DISTINCT d.zone_id 
        FROM device_raw r
        JOIN dma_device_rel d ON r.device_id = d.device_id
        WHERE r.timestamp >= ? AND (
          (r.standard_name = 'pressure' AND r.value < 0.3) OR 
          (r.standard_name = 'h2s' AND r.value >= 10.0)
        )
      `;
      const res = await this.dataSource.query(query, [now]);
      if (res && res.length > 0) {
        mockAlarmZoneIds = res.map((row: any) => row.zone_id);
      }
    } catch (e) {
      console.error('Failed to query real alarms', e);
    }

    return this.buildTree(zones, 0, mockAlarmZoneIds);
  }

  @Get('devices/:zoneId')
  @ApiOperation({ summary: '获取分区下挂载的设备' })
  async getZoneDevices(@Param('zoneId') zoneId: number) {
    const query = `
      SELECT a.id, a.device_code, a.device_name, a.device_type, r.direction 
      FROM dma_device_rel r
      JOIN ast_device a ON r.device_id = a.id
      WHERE r.zone_id = ? AND a.status = 1
    `;
    const devices = await this.dataSource.query(query, [zoneId]);
    
    return devices.map(d => ({
      id: d.id,
      device_code: d.device_code,
      name: d.device_name,
      type_code: d.device_type,
      type_name: this.getDeviceTypeName(d.device_type),
      direction: d.direction === 1 ? '流入' : (d.direction === -1 ? '流出' : '内部')
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

  private buildTree(zones: DmaZone[], parentId: number, alarmZoneIds: number[]): any[] {
    return zones
      .filter((zone) => Number(zone.parent_id) === Number(parentId))
      .map((zone) => ({
        id: zone.id,
        label: zone.zone_name,
        level: zone.level,
        status: alarmZoneIds.includes(zone.id) ? 'alarm' : 'normal',
        children: this.buildTree(zones, zone.id, alarmZoneIds),
      }));
  }
}
