import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 50, { message: '用户名长度需在3到50个字符之间' })
  username: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '部门ID', example: 1 })
  @IsInt({ message: '部门ID必须为整数' })
  @IsNotEmpty({ message: '部门ID不能为空' })
  dept_id: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsInt()
  @IsOptional()
  dept_id?: number;

  @ApiPropertyOptional({ description: '状态: 1-正常, 0-停用', example: 1 })
  @IsNumber()
  @IsOptional()
  status?: number;
}
