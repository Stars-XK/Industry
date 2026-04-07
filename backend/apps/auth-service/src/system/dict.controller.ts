import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from '../../../../libs/entities/src/dict-type.entity';
import { DictData } from '../../../../libs/entities/src/dict-data.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDictTypeDto, UpdateDictTypeDto, CreateDictDataDto, UpdateDictDataDto } from './dto/dict.dto';

@ApiTags('字典管理')
@ApiBearerAuth()
@Controller('api/system/dict')
@UseGuards(AuthGuard('jwt'))
export class DictController {
  constructor(
    @InjectRepository(DictType)
    private readonly dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData)
    private readonly dictDataRepository: Repository<DictData>,
  ) {}

  // ================= 字典类型接口 =================
  @Get('type/list')
  @ApiOperation({ summary: '获取字典类型列表' })
  async getDictTypeList() {
    const list = await this.dictTypeRepository.find();
    return list;
  }

  @Post('type/create')
  @ApiOperation({ summary: '创建字典类型' })
  async createDictType(@Request() req, @Body() body: CreateDictTypeDto) {
    const type = new DictType();
    type.dict_name = body.dict_name;
    type.dict_type = body.dict_type;
    type.remark = body.remark;
    type.created_by = req.user.userId;
    if (body.status !== undefined) type.status = body.status;
    await this.dictTypeRepository.save(type);
    return null;
  }

  @Delete('type/delete/:id')
  @ApiOperation({ summary: '删除字典类型' })
  async deleteDictType(@Request() req, @Param('id') id: number) {
    const type = await this.dictTypeRepository.findOne({ where: { id } });
    if (type) {
      // 级联删除字典数据 (软删除)
      await this.dictDataRepository.softDelete({ dict_type: type.dict_type });
      await this.dictTypeRepository.softDelete(id);
    }
    return null;
  }

  // ================= 字典数据接口 =================
  @Get('data/list/:dictType')
  @ApiOperation({ summary: '获取指定字典类型的数据列表' })
  async getDictDataByType(@Param('dictType') dictType: string) {
    const list = await this.dictDataRepository.find({
      where: { dict_type: dictType, status: 1 },
      order: { dict_sort: 'ASC' }
    });
    return list;
  }

  @Post('data/create')
  @ApiOperation({ summary: '创建字典数据项' })
  async createDictData(@Request() req, @Body() body: CreateDictDataDto) {
    const data = new DictData();
    data.dict_type = body.dict_type;
    data.dict_label = body.dict_label;
    data.dict_value = body.dict_value;
    data.dict_sort = body.dict_sort || 0;
    data.created_by = req.user.userId;
    if (body.status !== undefined) data.status = body.status;
    await this.dictDataRepository.save(data);
    return null;
  }

  @Delete('data/delete/:id')
  @ApiOperation({ summary: '删除字典数据项' })
  async deleteDictData(@Param('id') id: number) {
    await this.dictDataRepository.softDelete(id);
    return null;
  }
}
