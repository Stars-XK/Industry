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

  @ApiPropertyOptional({ description: '路由路径', example: '/system/user' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '前端组件路径', example: 'system/user/index' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '权限标识', example: 'sys:user:list' })
  @IsString()
  @IsOptional()
  perm_code?: string;

  @ApiPropertyOptional({ description: '菜单类型: M-目录, C-菜单, F-按钮', example: 'C' })
  @IsString()
  @IsIn(['M', 'C', 'F'])
  @IsOptional()
  menu_type?: string;
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

  @ApiPropertyOptional({ description: '路由路径' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '前端组件路径' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '权限标识' })
  @IsString()
  @IsOptional()
  perm_code?: string;

  @ApiPropertyOptional({ description: '菜单类型: M-目录, C-菜单, F-按钮' })
  @IsString()
  @IsIn(['M', 'C', 'F'])
  @IsOptional()
  menu_type?: string;
}
