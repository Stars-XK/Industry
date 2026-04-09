import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { TDengineService } from '@app/database/tdengine/tdengine.service';

@Injectable()
export class AlarmTaskService {
  private readonly logger = new Logger(AlarmTaskService.name);

  constructor(
    private dataSource: DataSource,
    private readonly tdengine: TDengineService
  ) {}

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
        // 从 TDengine 时序数据库提取近 5 分钟内该规则对应的最新数据
        let tdQuery = `SELECT LAST_ROW(raw_value) as val, ts FROM device_raw WHERE ts >= NOW - 5m AND device_id = '${rule.device_id}'`;
        
        try {
          const latestData = await this.tdengine.query(tdQuery);
          if (!latestData || latestData.length === 0) continue;

          const row = latestData[0];
          let isTriggered = false;

          switch (rule.condition_type) {
            case '>': isTriggered = row.val > rule.threshold; break;
            case '<': isTriggered = row.val < rule.threshold; break;
            case '>=': isTriggered = row.val >= rule.threshold; break;
            case '<=': isTriggered = row.val <= rule.threshold; break;
            case '==': isTriggered = row.val === rule.threshold; break;
          }

          if (isTriggered) {
            // 检查该设备该指标是否已经存在未恢复的同级别报警，避免报警风暴重复插入
            const existing = await this.dataSource.query(
              `SELECT id FROM alm_event WHERE device_id = ? AND alarm_type = ? AND status = 0`,
              [rule.device_id, rule.tag_name.toUpperCase() + '_' + rule.condition_type]
            );

            if (existing.length === 0) {
              const desc = `[自动判定] 设备 ${rule.device_id} 指标 ${rule.tag_name} 值 ${row.val} 触碰阈值 ${rule.condition_type} ${rule.threshold}`;
              await this.dataSource.query(
                `INSERT INTO alm_event (device_id, alarm_type, alarm_level, alarm_value, alarm_desc, status, sop_id) VALUES (?, ?, ?, ?, ?, 0, ?)`,
                [rule.device_id, rule.tag_name.toUpperCase() + '_' + rule.condition_type, rule.alarm_level, row.val, desc, rule.sop_id]
              );
              this.logger.warn(`触发新报警: ${desc}`);
            }
          }
        } catch (err) {
          this.logger.debug(`[TDengine] 报警查询失败或未建表: ${err.message}`);
        }
      }
    } catch (e) {
      this.logger.error('报警规则判定任务执行失败', e);
    }
  }
}
