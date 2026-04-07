import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { IotTagMapping } from '../../../../libs/entities/src/iot-tag-mapping.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('边缘测点标签映射')
@ApiBearerAuth()
@Controller('api/data-center/edge-tag')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class EdgeTagController {
  constructor(
    @InjectRepository(IotTagMapping)
    private readonly tagMappingRepo: Repository<IotTagMapping>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取标签映射列表' })
  @RequirePermissions('gov:edge:list')
  async getList(
    @Query('page') page = 1,
    @Query('size') size = 10,
    @Query('keyword') keyword = '',
    @Query('device_id') device_id?: number
  ) {
    const where: any = {};
    if (keyword) {
      where.tag_name = Like(`%${keyword}%`);
    }
    if (device_id) {
      where.device_id = device_id;
    }

    const [list, total] = await this.tagMappingRepo.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { id: 'DESC' }
    });

    return { list, total };
  }

  @Post('create')
  @ApiOperation({ summary: '创建标签映射' })
  @RequirePermissions('gov:edge:add')
  async create(@Body() body: any) {
    const newTag = this.tagMappingRepo.create(body);
    await this.tagMappingRepo.save(newTag);
    return true;
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新标签映射' })
  @RequirePermissions('gov:edge:update')
  async update(@Param('id') id: number, @Body() body: any) {
    await this.tagMappingRepo.update(id, body);
    return true;
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除标签映射' })
  @RequirePermissions('gov:edge:delete')
  async delete(@Param('id') id: number) {
    await this.tagMappingRepo.delete(id);
    return true;
  }
}
