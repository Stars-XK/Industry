import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysConfig } from '../../../../libs/entities/src/sys-config.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('config')
export class ConfigController {
  constructor(
    @InjectRepository(SysConfig)
    private readonly configRepository: Repository<SysConfig>,
  ) {}

  // 1. 获取所有配置列表（供后台管理表格使用）
  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async getConfigList(@Query() query: any) {
    const page = parseInt(query.pageNum || '1');
    const size = parseInt(query.pageSize || '10');
    
    const queryBuilder = this.configRepository.createQueryBuilder('config');
    if (query.configName) {
      queryBuilder.andWhere('config.configName LIKE :name', { name: `%${query.configName}%` });
    }
    if (query.configKey) {
      queryBuilder.andWhere('config.configKey LIKE :key', { key: `%${query.configKey}%` });
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      code: 200,
      data: { list, total },
      message: 'success'
    };
  }

  // 2. 获取公开的全局配置（供前端应用初始化，无需 Token）
  @Get('global')
  async getGlobalConfig() {
    const configs = await this.configRepository.find();
    // 转换为前端好读取的 key-value 对象
    const configMap: Record<string, string> = {};
    configs.forEach(c => {
      configMap[c.configKey] = c.configValue;
    });

    return {
      code: 200,
      data: configMap,
      message: 'success'
    };
  }

  // 3. 根据 ID 获取单条详情
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getConfigById(@Param('id') id: number) {
    const data = await this.configRepository.findOne({ where: { id } });
    return { code: 200, data, message: 'success' };
  }

  // 4. 新增配置
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createConfig(@Body() body: Partial<SysConfig>, @Req() req: any) {
    const newConfig = this.configRepository.create({
      ...body,
      createdBy: req.user?.userId
    });
    await this.configRepository.save(newConfig);
    return { code: 200, message: '新增成功' };
  }

  // 5. 修改配置
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateConfig(@Body() body: Partial<SysConfig>, @Req() req: any) {
    if (!body.id) return { code: 400, message: 'ID 不能为空' };
    await this.configRepository.update(body.id, {
      ...body,
      updatedBy: req.user?.userId
    });
    return { code: 200, message: '修改成功' };
  }

  // 6. 批量修改配置值（针对快捷保存面板）
  @UseGuards(AuthGuard('jwt'))
  @Put('batch')
  async batchUpdateConfig(@Body() body: { configs: { configKey: string, configValue: string }[] }, @Req() req: any) {
    if (!body.configs || !Array.isArray(body.configs)) {
      return { code: 400, message: '参数格式错误' };
    }
    
    for (const item of body.configs) {
      await this.configRepository.update(
        { configKey: item.configKey },
        { configValue: item.configValue, updatedBy: req.user?.userId }
      );
    }
    return { code: 200, message: '批量保存成功' };
  }

  // 7. 删除配置
  @UseGuards(AuthGuard('jwt'))
  @Delete(':ids')
  async deleteConfig(@Param('ids') ids: string) {
    const idArray = ids.split(',').map(id => parseInt(id));
    await this.configRepository.delete(idArray);
    return { code: 200, message: '删除成功' };
  }
}
