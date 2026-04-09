import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TDengineService implements OnModuleInit {
  private readonly logger = new Logger(TDengineService.name);
  private client: AxiosInstance;
  private readonly dbName = process.env.TD_DB_NAME || 'industry_ts';

  constructor() {
    const host = process.env.TD_HOST || '139.224.26.134';
    const port = process.env.TD_PORT || '6041';
    const user = process.env.TD_USER || 'root';
    const password = process.env.TD_PASSWORD || 'taosdata';

    this.client = axios.create({
      baseURL: `http://${host}:${port}/rest/sql`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
      },
      timeout: 5000,
    });
  }

  async onModuleInit() {
    this.logger.log('TDengine 连接初始化检查...');
    try {
      await this.query('SELECT server_version()');
      this.logger.log('TDengine 连接成功！');
      await this.initDatabaseAndTables();
    } catch (error) {
      this.logger.error('TDengine 连接失败 (如果是开发环境未装TDengine，此报错可忽略)', error.message);
    }
  }

  /**
   * 执行原始 SQL 语句
   */
  async query(sql: string): Promise<any> {
    try {
      const response = await this.client.post('', sql);
      return response.data;
    } catch (error) {
      this.logger.error(`TDengine 执行 SQL 失败: ${sql}`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 初始化数据库和超级表
   */
  private async initDatabaseAndTables() {
    try {
      await this.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName} KEEP 3650 DAYS 10 BLOCKS 6 UPDATE 1;`);
      await this.query(`USE ${this.dbName};`);

      // 创建设备原始数据超级表
      await this.query(`
        CREATE STABLE IF NOT EXISTS device_raw (
          ts TIMESTAMP,
          raw_value DOUBLE
        ) TAGS (
          device_id VARCHAR(50),
          zone_id VARCHAR(30),
          device_type TINYINT
        );
      `);

      // 创建 DMA 5分钟级预聚合超级表
      await this.query(`
        CREATE STABLE IF NOT EXISTS dma_5m (
          ts TIMESTAMP,
          supply DOUBLE,
          sale DOUBLE,
          balance_value DOUBLE,
          night_flow DOUBLE
        ) TAGS (
          zone_id VARCHAR(30)
        );
      `);
      this.logger.log('TDengine 超级表检查/创建完毕');
    } catch (error) {
      this.logger.error('初始化 TDengine 表结构失败', error);
    }
  }
}
