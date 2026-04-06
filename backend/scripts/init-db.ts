import { Client } from 'pg';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// 配置参数 (实际应用中应从 .env 读取)
const PG_CONFIG = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  port: parseInt(process.env.PG_PORT || '5432'),
};

const TDENGINE_REST_URL = process.env.TD_REST_URL || 'http://localhost:6041/rest/sql';
const TDENGINE_AUTH = process.env.TD_AUTH || 'Basic cm9vdDp0YW9zZGF0YQ=='; // root:taosdata base64

async function initPostgreSQL() {
  console.log('\n--- 正在初始化 PostgreSQL ---');
  const client = new Client(PG_CONFIG);
  try {
    await client.connect();
    
    // 1. 读取并执行表结构 SQL
    const schemaSql = fs.readFileSync(path.join(__dirname, 'sql/pg_schema.sql'), 'utf8');
    console.log('>>> 执行 pg_schema.sql (创建表结构与索引)...');
    await client.query(schemaSql);
    console.log('✅ PostgreSQL 表结构与索引创建完成！');

    // 2. 读取并执行测试数据 (Seed) SQL
    const seedSql = fs.readFileSync(path.join(__dirname, 'sql/pg_seed.sql'), 'utf8');
    console.log('>>> 执行 pg_seed.sql (插入初始化/测试数据)...');
    await client.query(seedSql);
    console.log('✅ PostgreSQL 初始化与测试数据插入完成！');

  } catch (error) {
    console.error('❌ PostgreSQL 初始化失败:', error);
  } finally {
    await client.end();
  }
}

async function initTDengine() {
  console.log('\n--- 正在初始化 TDengine ---');
  try {
    // 读取 TDengine 的建表与流计算脚本
    const tdSql = fs.readFileSync(path.join(__dirname, 'sql/tdengine_schema.sql'), 'utf8');
    // TDengine REST API 一次只能执行一条 SQL 语句，我们需要将脚本按分号分割
    const sqlStatements = tdSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      console.log(`>>> 执行 TDengine SQL [${i + 1}/${sqlStatements.length}]...`);
      await axios.post(TDENGINE_REST_URL, sql, {
        headers: { Authorization: TDENGINE_AUTH }
      });
    }
    console.log('✅ TDengine 表结构与流计算 (Stream) 初始化完成！');
  } catch (error: any) {
    // 处理 axios 请求错误
    const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('❌ TDengine 初始化失败 (请确保 TDengine 已经启动并且 REST 端口 6041 开放):', errMsg);
  }
}

async function run() {
  console.log('===================================================');
  console.log('🚀 开始执行信创工业综合治理平台 - 数据库初始化脚本');
  console.log('===================================================');
  
  await initPostgreSQL();
  await initTDengine();

  console.log('\n🎉 所有数据库初始化任务结束！');
}

run();
