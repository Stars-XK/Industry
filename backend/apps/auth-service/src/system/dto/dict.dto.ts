import { IsString, IsNotEmpty, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典名称', example: '设备类型' })
  @IsString()
  @IsNotEmpty({ message: '字典名称不能为空' })
  dict_name: string;

  @ApiProperty({ description: '字典类型(全局唯一)', example: 'sys_device_type' })
  @IsString()
  @IsNotEmpty({ message: '字典类型不能为空' })
  dict_type: string;

  @ApiPropertyOptional({ description: '状态: 1-正常, 0-停用', example: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注', example: '用于标识物联网设备的类型' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateDictTypeDto {
  @ApiPropertyOptional({ description: '字典名称' })
  @IsString()
  @IsOptional()
  dict_name?: string;

  @ApiPropertyOptional({ description: '字典类型(全局唯一)' })
  @IsString()
  @IsOptional()
  dict_type?: string;

  @ApiPropertyOptional({ description: '状态: 1-正常, 0-停用' })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class CreateDictDataDto {
  @ApiProperty({ description: '字典标签', example: '智能水表' })
  @IsString()
  @IsNotEmpty({ message: '字典标签不能为空' })
  dict_label: string;

  @ApiProperty({ description: '字典键值', example: '1' })
  @IsString()
  @IsNotEmpty({ message: '字典键值不能为空' })
  dict_value: string;

  @ApiProperty({ description: '所属字典类型', example: 'sys_device_type' })
  @IsString()
  @IsNotEmpty({ message: '字典类型不能为空' })
  dict_type: string;

  @ApiPropertyOptional({ description: '排序', example: 1 })
  @IsInt()
  @IsOptional()
  dict_sort?: number;

  @ApiPropertyOptional({ description: '状态: 1-正常, 0-停用', example: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

export class UpdateDictDataDto {
  @ApiPropertyOptional({ description: '字典标签' })
  @IsString()
  @IsOptional()
  dict_label?: string;

  @ApiPropertyOptional({ description: '字典键值' })
  @IsString()
  @IsOptional()
  dict_value?: string;

  @ApiPropertyOptional({ description: '所属字典类型' })
  @IsString()
  @IsOptional()
  dict_type?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @IsOptional()
  dict_sort?: number;

  @ApiPropertyOptional({ description: '状态: 1-正常, 0-停用' })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}
