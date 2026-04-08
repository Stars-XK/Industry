import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('工业配方管理')
@ApiBearerAuth()
@Controller('data-center/recipe')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RecipeController {
  constructor(private dataSource: DataSource) {}

  @Get('list')
  @ApiOperation({ summary: '获取配方列表' })
  @RequirePermissions('gov:recipe')
  async getRecipes() {
    return await this.dataSource.query(`SELECT * FROM biz_recipe ORDER BY id DESC`);
  }

  @Post()
  @ApiOperation({ summary: '创建配方' })
  @RequirePermissions('gov:recipe')
  async createRecipe(@Body() body: any) {
    const { recipe_name, process_type, parameters_json, status } = body;
    await this.dataSource.query(
      `INSERT INTO biz_recipe (recipe_name, process_type, parameters_json, status) VALUES (?, ?, ?, ?)`,
      [recipe_name, process_type, JSON.stringify(parameters_json), status || 1]
    );
    return { success: true };
  }

  @Put(':id')
  @ApiOperation({ summary: '修改配方' })
  @RequirePermissions('gov:recipe')
  async updateRecipe(@Param('id') id: string, @Body() body: any) {
    const { recipe_name, process_type, parameters_json, status } = body;
    await this.dataSource.query(
      `UPDATE biz_recipe SET recipe_name=?, process_type=?, parameters_json=?, status=? WHERE id=?`,
      [recipe_name, process_type, JSON.stringify(parameters_json), status, id]
    );
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除配方' })
  @RequirePermissions('gov:recipe')
  async deleteRecipe(@Param('id') id: string) {
    await this.dataSource.query(`DELETE FROM biz_recipe WHERE id = ?`, [id]);
    return { success: true };
  }
}
