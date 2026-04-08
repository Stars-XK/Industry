import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, Length, IsEmail, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 50, { message: '用户名长度需在3到50个字符之间' })
  username: string;

  @ApiProperty({ description: '用户昵称', example: '张三' })
  @IsString()
  @IsNotEmpty({ message: '用户昵称不能为空' })
  @Length(1, 30, { message: '用户昵称长度需在1到30个字符之间' })
  nickname: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '用户邮箱', example: 'zhangsan@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '用户性别（0未知 1男 2女）', example: 1 })
  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  gender?: number;

  @ApiProperty({ description: '部门ID', example: 1 })
  @IsInt({ message: '部门ID必须为整数' })
  @IsNotEmpty({ message: '部门ID不能为空' })
  dept_id: number;

  @ApiPropertyOptional({ description: '备注', example: '新入职员工' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '分配的角色ID列表', example: [1, 2] })
  @IsOptional()
  roleIds?: number[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户昵称' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '用户邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '用户性别（0未知 1男 2女）' })
  @IsInt()
  @IsOptional()
  gender?: number;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsInt()
  @IsOptional()
  dept_id?: number;

  @ApiPropertyOptional({ description: '状态: 1-正常, 0-停用', example: 1 })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '分配的角色ID列表', example: [1, 2] })
  @IsOptional()
  roleIds?: number[];
}
