import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class AlarmTaskService {
  private readonly logger = new Logger(AlarmTaskService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * 工业级报警规则引擎：每分钟扫描一次设备原始表，结合 alm_rule 生成报警事件。
   */
  @Cron('0 * * * * *')
  async evaluateAlarmRules() {
    this.logger.debug('--- [CRON START] 触发工业级定时任务: 报警规则阈值判定 ---');
    try {
      const rules = await this.dataSource.query(`SELECT * FROM alm_rule WHERE status = 1`);
      if (rules.length === 0) return;

      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      for (const rule of rules) {
        // 提取近 5 分钟内该规则对应的最新数据
        let dataQuery = `SELECT id, device_id, standard_name, value, timestamp FROM device_raw WHERE standard_name = ? AND timestamp >= ?`;
        const params: any[] = [rule.tag_name, fiveMinutesAgo];

        if (rule.device_id) {
          dataQuery += ` AND device_id = ?`;
          params.push(rule.device_id);
        }
        dataQuery += ` ORDER BY id DESC LIMIT 1`;

        const latestData = await this.dataSource.query(dataQuery, params);
        if (latestData.length === 0) continue;

        const row = latestData[0];
        let isTriggered = false;

        switch (rule.condition_type) {
          case '>': isTriggered = row.value > rule.threshold; break;
          case '<': isTriggered = row.value < rule.threshold; break;
          case '>=': isTriggered = row.value >= rule.threshold; break;
          case '<=': isTriggered = row.value <= rule.threshold; break;
          case '==': isTriggered = row.value === rule.threshold; break;
        }

        if (isTriggered) {
          // 检查该设备该指标是否已经存在未恢复的同级别报警，避免报警风暴重复插入
          const existing = await this.dataSource.query(
            `SELECT id FROM alm_event WHERE device_id = ? AND alarm_type = ? AND status = 0`,
            [row.device_id, rule.tag_name.toUpperCase() + '_' + rule.condition_type]
          );

          if (existing.length === 0) {
            const desc = `[自动判定] 设备 ${row.device_id} 指标 ${rule.tag_name} 值 ${row.value} 触碰阈值 ${rule.condition_type} ${rule.threshold}`;
            await this.dataSource.query(
              `INSERT INTO alm_event (device_id, alarm_type, alarm_level, alarm_value, alarm_desc, status, sop_id) VALUES (?, ?, ?, ?, ?, 0, ?)`,
              [row.device_id, rule.tag_name.toUpperCase() + '_' + rule.condition_type, rule.alarm_level, row.value, desc, rule.sop_id]
            );
            this.logger.warn(`触发新报警: ${desc}`);
          }
        }
      }
    } catch (e) {
      this.logger.error('报警规则判定任务执行失败', e);
    }
  }
}
