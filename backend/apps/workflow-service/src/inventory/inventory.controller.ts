import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PermissionsGuard } from '@app/common/guards/permissions.guard';

@Controller('api/workflow/inventory')
@UseGuards(PermissionsGuard)
export class InventoryController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async getInventory(@Query() query: any) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM ast_inventory WHERE 1=1';
    const params: any[] = [];

    if (query.part_name) {
      sql += ' AND part_name LIKE ?';
      params.push(`%${query.part_name}%`);
    }

    if (query.category) {
      sql += ' AND category = ?';
      params.push(query.category);
    }

    const countSql = `SELECT COUNT(*) as total FROM (${sql}) AS t`;
    const countResult = await this.dataSource.query(countSql, params);
    const total = parseInt(countResult[0].total);

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const records = await this.dataSource.query(sql, params);

    // Calculate alerts
    records.forEach(r => {
      r.is_low_stock = parseFloat(r.stock_quantity) <= parseFloat(r.safe_stock);
    });

    return {
      code: 200,
      data: {
        records,
        total,
        page,
        limit
      },
      message: 'success'
    };
  }

  @Get(':id')
  async getInventoryDetail(@Param('id') id: string) {
    const records = await this.dataSource.query('SELECT * FROM ast_inventory WHERE id = ?', [id]);
    return {
      code: 200,
      data: records[0],
      message: 'success'
    };
  }

  @Post()
  async createInventory(@Body() data: any) {
    const sql = `
      INSERT INTO ast_inventory (part_name, part_code, category, specification, unit, stock_quantity, safe_stock, unit_price, location, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.dataSource.query(sql, [
      data.part_name,
      data.part_code,
      data.category,
      data.specification,
      data.unit,
      data.stock_quantity || 0,
      data.safe_stock || 0,
      data.unit_price || 0,
      data.location,
      data.status ?? 1
    ]);

    // Initial log
    if (data.stock_quantity > 0) {
      await this.dataSource.query(
        `INSERT INTO ast_inventory_log (part_id, change_type, quantity, after_stock, remark) VALUES (?, 1, ?, ?, '初始化入库')`,
        [result.insertId, data.stock_quantity, data.stock_quantity]
      );
    }

    return { code: 200, data: result.insertId, message: '创建成功' };
  }

  @Put(':id')
  async updateInventory(@Param('id') id: string, @Body() data: any) {
    const sql = `
      UPDATE ast_inventory SET 
        part_name = ?, category = ?, specification = ?, unit = ?, 
        safe_stock = ?, unit_price = ?, location = ?, status = ?
      WHERE id = ?
    `;
    await this.dataSource.query(sql, [
      data.part_name,
      data.category,
      data.specification,
      data.unit,
      data.safe_stock,
      data.unit_price,
      data.location,
      data.status,
      id
    ]);
    return { code: 200, data: null, message: '更新成功' };
  }

  @Delete(':id')
  async deleteInventory(@Param('id') id: string) {
    await this.dataSource.query('DELETE FROM ast_inventory WHERE id = ?', [id]);
    return { code: 200, data: null, message: '删除成功' };
  }

  // Stock operation (in/out)
  @Post(':id/stock')
  async operateStock(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const { change_type, quantity, order_id, remark } = data;
    const user_id = req.user?.userId || 1;

    // Use transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock row
      const parts = await queryRunner.query('SELECT * FROM ast_inventory WHERE id = ? FOR UPDATE', [id]);
      if (!parts.length) throw new Error('备件不存在');
      
      const part = parts[0];
      const currentStock = parseFloat(part.stock_quantity);
      const diff = parseFloat(quantity);
      
      let newStock = currentStock;
      if (change_type === 1) {
        newStock += diff;
      } else if (change_type === -1) {
        if (currentStock < diff) throw new Error('库存不足');
        newStock -= diff;
      } else {
        newStock = diff; // override for inventory check
      }

      await queryRunner.query('UPDATE ast_inventory SET stock_quantity = ? WHERE id = ?', [newStock, id]);
      
      await queryRunner.query(
        `INSERT INTO ast_inventory_log (part_id, order_id, change_type, quantity, after_stock, operator_id, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, order_id || null, change_type, quantity, newStock, user_id, remark]
      );

      await queryRunner.commitTransaction();
      return { code: 200, data: null, message: '库存操作成功' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { code: 500, data: null, message: err.message };
    } finally {
      await queryRunner.release();
    }
  }

  @Get(':id/logs')
  async getInventoryLogs(@Param('id') id: string) {
    const sql = `
      SELECT l.*, u.nickname as operator_name, o.order_sn 
      FROM ast_inventory_log l
      LEFT JOIN sys_user u ON l.operator_id = u.id
      LEFT JOIN wf_work_order o ON l.order_id = o.id
      WHERE l.part_id = ?
      ORDER BY l.id DESC LIMIT 50
    `;
    const records = await this.dataSource.query(sql, [id]);
    return { code: 200, data: records, message: 'success' };
  }
}
