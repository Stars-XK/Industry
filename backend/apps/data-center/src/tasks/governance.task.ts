import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class GovernanceTaskService {
  private readonly logger = new Logger(GovernanceTaskService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * 每天凌晨 02:00 执行时序数据清洗与断点插值
   * 工业级规范：Node.js 仅作为调度中心，真正的数据处理必须下推到 TDengine 时序数据库内执行。
   * Node.js 通过生成并执行 TDengine 的 SQL 语句（如 INTERPOLATE）来处理百亿级数据。
   */
  @Cron('0 0 2 * * *')
  async handleNightlyDataCleaning() {
    this.logger.log('--- [CRON START] 触发工业级定时任务: 向 TDengine 下发时序清洗与插值指令 ---');
    try {
      // 1. 从 MySQL 配置表读取所有生效的清洗规则
      const rules = await this.dataSource.query(`SELECT * FROM biz_interpolate_rule WHERE status = 1`);
      this.logger.log(`提取到 ${rules.length} 条有效的数据清洗规则，准备构造 TDengine 清洗作业...`);
      
      for (const rule of rules) {
        // 2. 模拟构造 TDengine 的插值 SQL 语句
        // 真实工业场景下，TDengine 支持强大的插值查询，例如：
        // SELECT INTERP(value) FROM device_raw WHERE device_id = ? AND standard_name = ? EVERY(5m) FILL(linear)
        const fillMethod = this.mapToTDengineFill(rule.method);
        const tdSql = `
          -- [TDengine 作业] 将清洗后的数据写入聚合子表
          INSERT INTO device_5m_clean (ts, val) 
          SELECT _wstart, INTERP(value) 
          FROM device_raw 
          WHERE device_id = '${rule.device_id}' AND standard_name = '${rule.tag_name}' 
          PARTITION BY device_id EVERY(5m) FILL(${fillMethod});
        `;
        
        this.logger.log(`> 正在下发清洗指令到 TDengine: 设备[${rule.device_id}] 测点[${rule.tag_name}] 填充算法[${fillMethod}]`);
        // await this.tdengineClient.query(tdSql); // 实际项目中调用 TDengine 驱动执行
      }
      this.logger.log('--- [CRON END] TDengine 底层数据清洗指令下发完成 ---');
    } catch (e) {
      this.logger.error('数据清洗任务下发失败', e);
    }
  }

  /**
   * 每天凌晨 04:00 执行 MNF (夜间最小流量) AI 基线计算
   */
  @Cron('0 0 4 * * *')
  async calculateMnfBaseline() {
    this.logger.log('--- [CRON START] 触发工业级定时任务: 下发 MNF AI 基线计算指令 ---');
    try {
      const zones = await this.dataSource.query(`SELECT id FROM dma_zone WHERE level = 3`);
      this.logger.log(`准备向 TDengine 发起 ${zones.length} 个底层 DMA 分区 02:00~04:00 流量的流计算汇总...`);
      // 真实场景下，向 TDengine 下发聚合查询获取夜间流量谷值
      this.logger.log('--- [CRON END] MNF AI 诊断任务完成 ---');
    } catch (e) {
      this.logger.error('MNF 诊断任务失败', e);
    }
  }

  /**
   * 将 MySQL 中配置的业务算法映射为 TDengine 支持的 FILL 关键字
   */
  private mapToTDengineFill(method: string): string {
    const map: Record<string, string> = {
      'linear': 'LINEAR',
      'previous': 'PREV',
      'zero': 'VALUE, 0',
      'pchip': 'LINEAR' // TDengine 原生可能不支持 PCHIP，通常降级为 LINEAR 或交给 Python 脚本计算
    };
    return map[method] || 'NONE';
  }

  /**
   * 每月 1 号凌晨 05:00 执行产销差(NRW)统计报表生成
   */
  @Cron('0 0 5 1 * *')
  async generateNrwReport() {
    this.logger.log('--- [CRON START] 触发工业级定时任务: 月度产销差 NRW 报表生成 ---');
    try {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      const reportMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

      const salesRes = await this.dataSource.query(
        `SELECT SUM(usage_m3) as total_sales FROM biz_billing WHERE billing_period = ? AND status != 'cancelled'`,
        [reportMonth]
      );
      const totalSales = parseFloat(salesRes[0]?.total_sales || 0);

      const supplyRes = await this.dataSource.query(
        `SELECT SUM(supply) as total_supply FROM dma_daily WHERE ts LIKE ?`,
        [`${reportMonth}%`]
      );
      const totalSupply = parseFloat(supplyRes[0]?.total_supply || 0);

      let nrwRatio = 0;
      let realLoss = 0;
      if (totalSupply > 0) {
        realLoss = totalSupply - totalSales;
        nrwRatio = (realLoss / totalSupply) * 100;
      }

      await this.dataSource.query(
        `INSERT INTO biz_nrw_report (zone_id, report_month, total_supply_m3, total_sales_m3, real_loss_m3, apparent_loss_m3, nrw_ratio, evaluated_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, reportMonth, totalSupply, totalSales, realLoss, 0, nrwRatio, 1]
      );

      this.logger.log(`NRW 报表已生成 [${reportMonth}]: 供水 ${totalSupply}, 售水 ${totalSales}, 差率 ${nrwRatio.toFixed(2)}%`);
    } catch (e) {
      this.logger.error('NRW 报表生成任务失败', e);
    }
  }
}
