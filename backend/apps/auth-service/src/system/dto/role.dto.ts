import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '厂长' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  role_name: string;

  @ApiProperty({ description: '角色标识', example: 'factory_manager' })
  @IsString()
  @IsNotEmpty({ message: '角色标识不能为空' })
  role_key: string;

  @ApiPropertyOptional({ description: '显示顺序', example: 1 })
  @IsInt()
  @IsOptional()
  role_sort?: number;

  @ApiPropertyOptional({ description: '数据范围: 1-全部, 2-本部门, 3-自定义', example: 2 })
  @IsInt()
  @IsIn([1, 2, 3])
  @IsOptional()
  data_scope?: number;

  @ApiPropertyOptional({ description: '角色状态（1正常 0停用）', example: 1 })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '分配的菜单ID数组', type: [Number], example: [1, 2, 3] })
  @IsInt({ each: true })
  @IsOptional()
  menu_ids?: number[];

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称' })
  @IsString()
  @IsOptional()
  role_name?: string;

  @ApiPropertyOptional({ description: '角色标识' })
  @IsString()
  @IsOptional()
  role_key?: string;

  @ApiPropertyOptional({ description: '显示顺序' })
  @IsInt()
  @IsOptional()
  role_sort?: number;

  @ApiPropertyOptional({ description: '数据范围: 1-全部, 2-本部门, 3-自定义' })
  @IsInt()
  @IsIn([1, 2, 3])
  @IsOptional()
  data_scope?: number;

  @ApiPropertyOptional({ description: '角色状态（1正常 0停用）' })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '分配的菜单ID数组', type: [Number] })
  @IsInt({ each: true })
  @IsOptional()
  menu_ids?: number[];

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
