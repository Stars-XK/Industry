import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { GovDatasourceConfig } from '../../../../libs/entities/src/gov-datasource-config.entity';

@Controller('data-center/governance/integration')
export class IntegrationController {
  constructor(
    @InjectRepository(GovDatasourceConfig)
    private readonly configRepository: Repository<GovDatasourceConfig>,
  ) {}

  @Get('status')
  async getChannelStatus() {
    return {
      code: 200,
      data: {
        channels: [
          { protocol: 'MQTT', status: 'connected', currentQps: 15400, lag: 0, uptime: '42d 12h' },
          { protocol: 'OPC_UA', status: 'connected', currentQps: 3200, lag: 15, uptime: '14d 08h' },
          { protocol: 'Modbus_TCP', status: 'connected', currentQps: 540, lag: 0, uptime: '42d 12h' },
          { protocol: 'Kafka_ERP', status: 'warning', currentQps: 15, lag: 14200, uptime: '2d 01h' }
        ],
        totalDevices: 4520,
        activeTags: 154000
      },
      message: 'success'
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async getList(@Query() query: any) {
    const page = parseInt(query.pageNum || '1');
    const size = parseInt(query.pageSize || '10');
    
    const queryBuilder = this.configRepository.createQueryBuilder('config');
    queryBuilder.where('config.isDeleted = 0');
    
    if (query.sourceName) {
      queryBuilder.andWhere('config.sourceName LIKE :name', { name: `%${query.sourceName}%` });
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return { code: 200, data: { list, total }, message: 'success' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() body: Partial<GovDatasourceConfig>, @Req() req: any) {
    const config = this.configRepository.create({
      ...body,
      createdBy: req.user?.userId
    });
    await this.configRepository.save(config);
    return { code: 200, message: '新增数据源成功' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async update(@Body() body: Partial<GovDatasourceConfig>, @Req() req: any) {
    await this.configRepository.update(body.id, {
      ...body,
      updatedBy: req.user?.userId
    });
    return { code: 200, message: '更新数据源成功' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    await this.configRepository.update(id, { isDeleted: 1, updatedBy: req.user?.userId });
    return { code: 200, message: '删除成功' };
  }
}
