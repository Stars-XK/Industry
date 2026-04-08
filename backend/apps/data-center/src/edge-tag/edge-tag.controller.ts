import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { IotTagMapping } from '../../../../libs/entities/src/iot-tag-mapping.entity';
import { IotGateway } from '../../../../libs/entities/src/iot-gateway.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('边缘测点标签映射')
@ApiBearerAuth()
@Controller('data-center/edge-tag')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class EdgeTagController {
  constructor(
    @InjectRepository(IotTagMapping)
    private readonly tagMappingRepo: Repository<IotTagMapping>,
    @InjectRepository(IotGateway)
    private readonly gatewayRepo: Repository<IotGateway>,
  ) {}

  @Get('gateways')
  @ApiOperation({ summary: '获取边缘网关列表及状态' })
  @RequirePermissions('gov:edge:list')
  async getGateways() {
    return this.gatewayRepo.find({ order: { id: 'ASC' } });
  }

  @Post('gateways/:id/protection-policy')
  @ApiOperation({ summary: '下发断网本地保护策略' })
  @RequirePermissions('gov:edge:control')
  async sendProtectionPolicy(@Param('id') id: number) {
    const gateway = await this.gatewayRepo.findOne({ where: { id } });
    if (!gateway || gateway.is_online === 0) {
      throw new HttpException('网关离线或不存在', HttpStatus.BAD_REQUEST);
    }
    // 模拟下发逻辑
    return { success: true, message: '策略已下发' };
  }

  @Post('import')
  @ApiOperation({ summary: '批量导入标签映射' })
  @RequirePermissions('gov:edge:add')
  @UseInterceptors(FileInterceptor('file'))
  async importTags(@UploadedFile() file: any) {
    // 模拟导入逻辑，实际应该解析 excel
    if (!file) {
      throw new HttpException('没有接收到文件', HttpStatus.BAD_REQUEST);
    }
    return { success: true, message: '批量导入成功', count: 10 };
  }

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
