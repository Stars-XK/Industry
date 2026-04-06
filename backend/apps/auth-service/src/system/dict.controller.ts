import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from '../../../../libs/entities/src/dict-type.entity';
import { DictData } from '../../../../libs/entities/src/dict-data.entity';
import { AuthGuard } from '@nestjs/passport';

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
  async getDictTypeList() {
    const list = await this.dictTypeRepository.find();
    return { code: 200, data: list, message: 'success' };
  }

  @Post('type/create')
  async createDictType(@Body() body: any) {
    const type = new DictType();
    type.dict_name = body.dict_name;
    type.dict_type = body.dict_type;
    type.remark = body.remark;
    await this.dictTypeRepository.save(type);
    return { code: 200, message: '创建字典类型成功' };
  }

  @Delete('type/delete/:id')
  async deleteDictType(@Param('id') id: number) {
    const type = await this.dictTypeRepository.findOne({ where: { id } });
    if (type) {
      // 级联删除字典数据
      await this.dictDataRepository.delete({ dict_type: type.dict_type });
      await this.dictTypeRepository.delete(id);
    }
    return { code: 200, message: '删除字典类型及其数据成功' };
  }

  // ================= 字典数据接口 =================
  // 获取某个类型下的所有字典项 (用于下拉框)
  @Get('data/list/:dictType')
  async getDictDataByType(@Param('dictType') dictType: string) {
    const list = await this.dictDataRepository.find({
      where: { dict_type: dictType, status: 1 },
      order: { dict_sort: 'ASC' }
    });
    return { code: 200, data: list, message: 'success' };
  }

  @Post('data/create')
  async createDictData(@Body() body: any) {
    const data = new DictData();
    data.dict_type = body.dict_type;
    data.dict_label = body.dict_label;
    data.dict_value = body.dict_value;
    data.dict_sort = body.dict_sort || 0;
    await this.dictDataRepository.save(data);
    return { code: 200, message: '新增字典项成功' };
  }

  @Delete('data/delete/:id')
  async deleteDictData(@Param('id') id: number) {
    await this.dictDataRepository.delete(id);
    return { code: 200, message: '删除字典项成功' };
  }
}
