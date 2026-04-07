import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  @Get('tree')
  @ApiOperation({ summary: '获取 DMA 拓扑树' })
  async getTopologyTree() {
    const zones = await this.dmaZoneRepo.find({
      where: { is_deleted: null },
      order: { id: 'ASC' }
    });
    return this.buildTree(zones, 0);
  }

  private buildTree(zones: DmaZone[], parentId: number): any[] {
    return zones
      .filter((zone) => Number(zone.parent_id) === Number(parentId))
      .map((zone) => ({
        id: zone.id,
        label: zone.zone_name,
        level: zone.level,
        children: this.buildTree(zones, zone.id),
      }));
  }
}
