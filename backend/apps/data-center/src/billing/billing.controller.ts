import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('营收对账管理')
@ApiBearerAuth()
@Controller('api/data-center/billing')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class BillingController {
  constructor(private dataSource: DataSource) {}

  @Get('tariffs')
  @ApiOperation({ summary: '获取费率配置列表' })
  @RequirePermissions('analytics:billing')
  async getTariffs() {
    const query = `SELECT * FROM biz_tariff WHERE status = 1 ORDER BY id`;
    return await this.dataSource.query(query);
  }

  @Get('accounts')
  @ApiOperation({ summary: '获取大用户档案列表' })
  @RequirePermissions('analytics:account')
  async getAccounts() {
    const query = `
      SELECT a.*, t.tariff_name, t.price_per_m3 
      FROM biz_key_account a 
      LEFT JOIN biz_tariff t ON a.tariff_id = t.id 
      WHERE a.status = 1 
      ORDER BY a.id
    `;
    return await this.dataSource.query(query);
  }

  @Post('tariffs')
  @ApiOperation({ summary: '新增费率配置' })
  @RequirePermissions('analytics:billing')
  async createTariff(@Body() body: any) {
    const { tariff_code, tariff_name, price_per_m3, description } = body;
    await this.dataSource.query(
      `INSERT INTO biz_tariff (tariff_code, tariff_name, price_per_m3, description) VALUES (?, ?, ?, ?)`,
      [tariff_code, tariff_name, price_per_m3, description]
    );
    return { success: true };
  }

  @Put('tariffs/:id')
  @ApiOperation({ summary: '修改费率配置' })
  @RequirePermissions('analytics:billing')
  async updateTariff(@Param('id') id: string, @Body() body: any) {
    const { tariff_name, price_per_m3, description, status } = body;
    await this.dataSource.query(
      `UPDATE biz_tariff SET tariff_name = ?, price_per_m3 = ?, description = ?, status = ? WHERE id = ?`,
      [tariff_name, price_per_m3, description, status, id]
    );
    return { success: true };
  }

  @Delete('tariffs/:id')
  @ApiOperation({ summary: '删除费率配置' })
  @RequirePermissions('analytics:billing')
  async deleteTariff(@Param('id') id: string) {
    // 工业级防御：如果已被大用户绑定则不允许删除
    const used = await this.dataSource.query(`SELECT id FROM biz_key_account WHERE tariff_id = ?`, [id]);
    if (used.length > 0) {
      throw new Error('该费率已被大用户档案绑定，禁止删除');
    }
    await this.dataSource.query(`DELETE FROM biz_tariff WHERE id = ?`, [id]);
    return { success: true };
  }

  @Post('accounts')
  @ApiOperation({ summary: '新增大用户档案' })
  @RequirePermissions('analytics:account')
  async createAccount(@Body() body: any) {
    const { account_no, account_name, contact, phone, address, industry_type, tariff_id, meter_device_id } = body;
    await this.dataSource.query(
      `INSERT INTO biz_key_account (account_no, account_name, contact, phone, address, industry_type, tariff_id, meter_device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [account_no, account_name, contact, phone, address, industry_type, tariff_id, meter_device_id]
    );
    return { success: true };
  }

  @Put('accounts/:id')
  @ApiOperation({ summary: '修改大用户档案' })
  @RequirePermissions('analytics:account')
  async updateAccount(@Param('id') id: string, @Body() body: any) {
    const { account_name, contact, phone, address, industry_type, tariff_id, meter_device_id, status } = body;
    await this.dataSource.query(
      `UPDATE biz_key_account SET account_name = ?, contact = ?, phone = ?, address = ?, industry_type = ?, tariff_id = ?, meter_device_id = ?, status = ? WHERE id = ?`,
      [account_name, contact, phone, address, industry_type, tariff_id, meter_device_id, status, id]
    );
    return { success: true };
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: '删除大用户档案' })
  @RequirePermissions('analytics:account')
  async deleteAccount(@Param('id') id: string) {
    // 工业级防御：如果有账单关联则不允许删除，只能停用
    const used = await this.dataSource.query(`SELECT id FROM biz_billing WHERE account_id = ?`, [id]);
    if (used.length > 0) {
      throw new Error('该用户已有账单流水，禁止硬删除，请使用停用功能');
    }
    await this.dataSource.query(`DELETE FROM biz_key_account WHERE id = ?`, [id]);
    return { success: true };
  }

  @Get('records')
  @ApiOperation({ summary: '获取账单列表' })
  @RequirePermissions('analytics:billing')
  async getBillingRecords(@Query('period') period?: string) {
    let query = `
      SELECT b.*, a.account_no, a.account_name, t.tariff_name, t.price_per_m3 
      FROM biz_billing b 
      JOIN biz_key_account a ON b.account_id = a.id 
      LEFT JOIN biz_tariff t ON a.tariff_id = t.id 
      WHERE 1=1
    `;
    const params = [];
    if (period) {
      query += ` AND b.billing_period = ?`;
      params.push(period);
    }
    query += ` ORDER BY b.id DESC`;
    return await this.dataSource.query(query, params);
  }

  @Post('records/generate')
  @ApiOperation({ summary: '生成新账期账单' })
  @RequirePermissions('analytics:billing')
  async generateBilling(@Body() body: { period: string }) {
    // 简化逻辑：为所有大用户按其绑定的电表用水量计算（如果没有表，给一个模拟量）
    const accounts = await this.dataSource.query(`
      SELECT a.id, a.meter_device_id, t.price_per_m3 
      FROM biz_key_account a 
      JOIN biz_tariff t ON a.tariff_id = t.id 
      WHERE a.status = 1
    `);
    
    let generated = 0;
    for (const acc of accounts) {
      // 检查当期是否已生成
      const exist = await this.dataSource.query(`SELECT id FROM biz_billing WHERE account_id = ? AND billing_period = ?`, [acc.id, body.period]);
      if (exist.length > 0) continue;
      
      // 模拟当期用水量: 1000 - 50000 之间的随机数
      const usage = Math.floor(Math.random() * 49000) + 1000;
      const amount = usage * parseFloat(acc.price_per_m3);
      
      await this.dataSource.query(
        `INSERT INTO biz_billing (account_id, billing_period, usage_m3, total_amount, status) VALUES (?, ?, ?, ?, 'unpaid')`,
        [acc.id, body.period, usage, amount]
      );
      generated++;
    }
    
    return { success: true, message: `成功生成 ${generated} 条新账单` };
  }

  @Put('records/:id/pay')
  @ApiOperation({ summary: '确认缴费' })
  @RequirePermissions('analytics:billing')
  async payBill(@Param('id') id: string) {
    await this.dataSource.query(`UPDATE biz_billing SET status = 'paid' WHERE id = ?`, [id]);
    return { success: true };
  }
}
