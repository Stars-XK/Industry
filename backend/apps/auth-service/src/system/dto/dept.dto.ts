import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsIn, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeptDto {
  @ApiPropertyOptional({ description: '父级部门ID，默认为0', example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  parent_id?: number;

  @ApiProperty({ description: '部门名称', example: '研发部' })
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  dept_name: string;

  @ApiPropertyOptional({ description: '显示顺序', example: 1 })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiPropertyOptional({ description: '负责人', example: '张三' })
  @IsString()
  @IsOptional()
  leader?: string;

  @ApiPropertyOptional({ description: '联系电话', example: '13800138000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'dept@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '部门状态（1正常 0停用）', example: 1 })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateDeptDto {
  @ApiPropertyOptional({ description: '父级部门ID' })
  @IsInt()
  @Min(0)
  @IsOptional()
  parent_id?: number;

  @ApiPropertyOptional({ description: '部门名称' })
  @IsString()
  @IsOptional()
  dept_name?: string;

  @ApiPropertyOptional({ description: '显示顺序' })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiPropertyOptional({ description: '负责人' })
  @IsString()
  @IsOptional()
  leader?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '部门状态（1正常 0停用）' })
  @IsInt()
  @IsIn([0, 1])
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
