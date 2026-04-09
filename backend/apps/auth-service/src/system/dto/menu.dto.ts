import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiPropertyOptional({ description: '父菜单ID，默认为0', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  parent_id?: number;

  @ApiProperty({ description: '菜单或按钮名称', example: '用户管理' })
  @IsString()
  @IsNotEmpty({ message: '菜单名称不能为空' })
  menu_name: string;

  @ApiPropertyOptional({ description: '显示顺序', example: 1 })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiPropertyOptional({ description: '路由路径', example: '/system/user' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '前端组件路径', example: 'system/user/index' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '是否为外链（1是 0否）', example: 0 })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  is_frame?: number;

  @ApiPropertyOptional({ description: '是否缓存（1缓存 0不缓存）', example: 0 })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  is_cache?: number;

  @ApiPropertyOptional({ description: '菜单类型: M-目录, C-菜单, F-按钮', example: 'C' })
  @IsString()
  @IsIn(['M', 'C', 'F'])
  @IsOptional()
  menu_type?: string;

  @ApiPropertyOptional({ description: '菜单显示状态（1显示 0隐藏）', example: 1 })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  visible?: number;

  @ApiPropertyOptional({ description: '菜单状态（1正常 0停用）', example: 1 })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '权限标识', example: 'sys:user:list' })
  @IsString()
  @IsOptional()
  perm_code?: string;

  @ApiPropertyOptional({ description: '菜单图标', example: 'User' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateMenuDto {
  @ApiPropertyOptional({ description: '父菜单ID' })
  @IsInt()
  @Min(0)
  @IsOptional()
  parent_id?: number;

  @ApiPropertyOptional({ description: '菜单或按钮名称' })
  @IsString()
  @IsOptional()
  menu_name?: string;

  @ApiPropertyOptional({ description: '显示顺序' })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiPropertyOptional({ description: '路由路径' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '前端组件路径' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '是否为外链（1是 0否）' })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  is_frame?: number;

  @ApiPropertyOptional({ description: '是否缓存（1缓存 0不缓存）' })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  is_cache?: number;

  @ApiPropertyOptional({ description: '菜单类型: M-目录, C-菜单, F-按钮' })
  @IsString()
  @IsIn(['M', 'C', 'F'])
  @IsOptional()
  menu_type?: string;

  @ApiPropertyOptional({ description: '菜单显示状态（1显示 0隐藏）' })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  visible?: number;

  @ApiPropertyOptional({ description: '菜单状态（1正常 0停用）' })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '权限标识' })
  @IsString()
  @IsOptional()
  perm_code?: string;

  @ApiPropertyOptional({ description: '菜单图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
