import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
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
}
