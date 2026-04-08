import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, Request, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DictType } from '../../../../libs/entities/src/dict-type.entity';
import { DictData } from '../../../../libs/entities/src/dict-data.entity';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDictTypeDto, UpdateDictTypeDto, CreateDictDataDto, UpdateDictDataDto } from './dto/dict.dto';

@ApiTags('字典管理')
@ApiBearerAuth()
@Controller('system/dict')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DictController {
  constructor(
    @InjectRepository(DictType)
    private readonly dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData)
    private readonly dictDataRepository: Repository<DictData>,
    private dataSource: DataSource
  ) {}

  @Get('type/list')
  @ApiOperation({ summary: '获取字典类型列表' })
  @RequirePermissions('sys:dict')
  async getDictTypes() {
    return await this.dataSource.query(`SELECT * FROM sys_dict_type ORDER BY id DESC`);
  }

  @Post('type')
  @ApiOperation({ summary: '新增字典类型' })
  @RequirePermissions('sys:dict')
  async createDictType(@Body() body: any) {
    const { dict_name, dict_type, status, remark } = body;
    await this.dataSource.query(
      `INSERT INTO sys_dict_type (dict_name, dict_type, status, remark) VALUES (?, ?, ?, ?)`,
      [dict_name, dict_type, status ?? 1, remark]
    );
    return { success: true };
  }

  @Put('type/:id')
  @ApiOperation({ summary: '修改字典类型' })
  @RequirePermissions('sys:dict')
  async updateDictType(@Param('id') id: string, @Body() body: any) {
    const { dict_name, dict_type, status, remark } = body;
    await this.dataSource.query(
      `UPDATE sys_dict_type SET dict_name = ?, dict_type = ?, status = ?, remark = ? WHERE id = ?`,
      [dict_name, dict_type, status, remark, id]
    );
    return { success: true };
  }

  @Delete('type/:id')
  @ApiOperation({ summary: '删除字典类型' })
  @RequirePermissions('sys:dict')
  async deleteDictType(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM sys_dict_type WHERE id = ?`, [id]);
    return { success: true };
  }

  @Get('data/list')
  @ApiOperation({ summary: '根据字典类型获取字典数据' })
  async getDictData(@Query('dictType') dictType: string) {
    return await this.dataSource.query(
      `SELECT * FROM sys_dict_data WHERE dict_type = ? ORDER BY dict_sort ASC`,
      [dictType]
    );
  }

  @Get('data/list/:dictType')
  @ApiOperation({ summary: '根据字典类型获取字典数据(路径参数)' })
  async getDictDataByPath(@Param('dictType') dictType: string) {
    return await this.dataSource.query(
      `SELECT * FROM sys_dict_data WHERE dict_type = ? ORDER BY dict_sort ASC`,
      [dictType]
    );
  }

  @Post('data')
  @ApiOperation({ summary: '新增字典数据' })
  @RequirePermissions('sys:dict')
  async createDictData(@Body() body: any) {
    const { dict_type, dict_label, dict_value, css_class, list_class, dict_sort, status, remark } = body;
    await this.dataSource.query(
      `INSERT INTO sys_dict_data (dict_type, dict_label, dict_value, css_class, list_class, dict_sort, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dict_type, dict_label, dict_value, css_class, list_class, dict_sort || 0, status ?? 1, remark]
    );
    return { success: true };
  }

  @Put('data/:id')
  @ApiOperation({ summary: '修改字典数据' })
  @RequirePermissions('sys:dict')
  async updateDictData(@Param('id') id: string, @Body() body: any) {
    const { dict_label, dict_value, css_class, list_class, dict_sort, status, remark } = body;
    await this.dataSource.query(
      `UPDATE sys_dict_data SET dict_label = ?, dict_value = ?, css_class = ?, list_class = ?, dict_sort = ?, status = ?, remark = ? WHERE id = ?`,
      [dict_label, dict_value, css_class, list_class, dict_sort, status, remark, id]
    );
    return { success: true };
  }

  @Delete('data/:id')
  @ApiOperation({ summary: '删除字典数据' })
  @RequirePermissions('sys:dict')
  async deleteDictData(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM sys_dict_data WHERE id = ?`, [id]);
    return { success: true };
  }
}
