import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermissions } from '@app/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('营收对账管理')
@ApiBearerAuth()
@Controller('data-center/billing')
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
      SELECT a.*, t.tariff_name, t.price_per_m3, d.device_name as meter_device_name
      FROM biz_key_account a 
      LEFT JOIN biz_tariff t ON a.tariff_id = t.id 
      LEFT JOIN ast_device d ON a.meter_device_id = d.id
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

  @Post('records/meter-reading')
  @ApiOperation({ summary: '录入大户水表当期抄表底度' })
  @RequirePermissions('analytics:billing')
  async addMeterReading(@Body() body: { account_id: number, device_id: number, period: string, value: number }) {
    await this.dataSource.query(
      `INSERT INTO biz_meter_reading (account_id, device_id, reading_period, reading_value) VALUES (?, ?, ?, ?)`,
      [body.account_id, body.device_id, body.period, body.value]
    );
    return { success: true };
  }

  @Get('records/meter-reading')
  @ApiOperation({ summary: '查询大户抄表底度列表' })
  @RequirePermissions('analytics:billing')
  async getMeterReadings() {
    const query = `
      SELECT r.*, a.account_name 
      FROM biz_meter_reading r
      JOIN biz_key_account a ON r.account_id = a.id
      ORDER BY r.id DESC
      LIMIT 100
    `;
    return await this.dataSource.query(query);
  }

  @Post('records/generate')
  @ApiOperation({ summary: '生成新账期账单(真实抄表底度计算)' })
  @RequirePermissions('analytics:billing')
  async generateBilling(@Body() body: { period: string }) {
    // 工业级真实计费逻辑：当期底数 - 上期底数 = 用水量 -> 乘以费率 -> 出账单
    const accounts = await this.dataSource.query(`
      SELECT a.id, a.meter_device_id, t.price_per_m3 
      FROM biz_key_account a 
      JOIN biz_tariff t ON a.tariff_id = t.id 
      WHERE a.status = 1 AND a.meter_device_id IS NOT NULL
    `);
    
    let generated = 0;
    const errors = [];

    // 计算上个账期 (如 2026-04 -> 2026-03)
    const [year, month] = body.period.split('-');
    let prevYear = parseInt(year);
    let prevMonth = parseInt(month) - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevPeriod = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;

    for (const acc of accounts) {
      const exist = await this.dataSource.query(`SELECT id FROM biz_billing WHERE account_id = ? AND billing_period = ?`, [acc.id, body.period]);
      if (exist.length > 0) continue;
      
      // 查询当期抄表
      const currReading = await this.dataSource.query(
        `SELECT reading_value FROM biz_meter_reading WHERE account_id = ? AND reading_period = ? ORDER BY id DESC LIMIT 1`,
        [acc.id, body.period]
      );
      
      // 查询上期抄表
      const prevReading = await this.dataSource.query(
        `SELECT reading_value FROM biz_meter_reading WHERE account_id = ? AND reading_period = ? ORDER BY id DESC LIMIT 1`,
        [acc.id, prevPeriod]
      );

      if (currReading.length === 0 || prevReading.length === 0) {
        errors.push(`账户ID ${acc.id} 缺乏 ${body.period} 或 ${prevPeriod} 的抄表底数`);
        continue;
      }

      const currVal = parseFloat(currReading[0].reading_value);
      const prevVal = parseFloat(prevReading[0].reading_value);
      const usage = currVal - prevVal;

      if (usage < 0) {
        errors.push(`账户ID ${acc.id} 底数倒转(表计异常)`);
        continue;
      }

      const amount = usage * parseFloat(acc.price_per_m3);
      
      await this.dataSource.query(
        `INSERT INTO biz_billing (account_id, billing_period, usage_m3, total_amount, status) VALUES (?, ?, ?, ?, 'unpaid')`,
        [acc.id, body.period, usage, amount.toFixed(2)]
      );
      generated++;
    }
    
    return { success: true, message: `成功生成 ${generated} 条真实账单`, errors };
  }

  @Put('records/:id/pay')
  @ApiOperation({ summary: '确认缴费' })
  @RequirePermissions('analytics:billing')
  async payBill(@Param('id') id: string) {
    await this.dataSource.query(`UPDATE biz_billing SET status = 'paid' WHERE id = ?`, [id]);
    return { success: true };
  }
}
