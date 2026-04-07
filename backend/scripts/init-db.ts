import * as mysql from 'mysql2/promise';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// 配置参数 (优先从环境变量读取，默认值采用最新的线上环境配置)
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || '139.224.26.134',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PWD || 'Trae@2025',
  database: process.env.DB_NAME || 'trae_industry',
  multipleStatements: true // 允许一次执行多条 SQL 语句
};

const TD_HOST = process.env.TDENGINE_HOST || '139.224.26.134';
const TD_PORT = process.env.TDENGINE_PORT || '6041';
const TDENGINE_REST_URL = `http://${TD_HOST}:${TD_PORT}/rest/sql`;
const TDENGINE_AUTH = process.env.TD_AUTH || 'Basic cm9vdDp0YW9zZGF0YQ=='; // root:taosdata base64

async function initMySQL() {
  console.log('\n--- 正在初始化 MySQL ---');
  let connection;
  try {
    connection = await mysql.createConnection(MYSQL_CONFIG);

    // 1. 读取并执行表结构 SQL
    const schemaSqlPath = path.join(__dirname, 'sql/mysql_schema.sql');
    if (fs.existsSync(schemaSqlPath)) {
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
      console.log('>>> 执行 mysql_schema.sql (创建表结构与索引)...');
      await connection.query(schemaSql);
      console.log('✅ MySQL 表结构与索引创建完成！');
    }

    // 2. 读取并执行测试数据 (Seed) SQL
    const seedSqlPath = path.join(__dirname, 'sql/mysql_seed.sql');
    if (fs.existsSync(seedSqlPath)) {
      const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
      console.log('>>> 执行 mysql_seed.sql (插入初始化/测试数据)...');
      await connection.query(seedSql);
      console.log('✅ MySQL 初始化与测试数据插入完成！');
    }

  } catch (error) {
    console.error('❌ MySQL 初始化失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function initTDengine() {
  console.log('\n--- 正在初始化 TDengine ---');
  try {
    // 读取 TDengine 的建表与流计算脚本
    const tdSqlPath = path.join(__dirname, 'sql/tdengine_schema.sql');
    if (!fs.existsSync(tdSqlPath)) {
      console.log('⚠️ 未找到 tdengine_schema.sql，跳过 TDengine 初始化。');
      return;
    }

    const tdSql = fs.readFileSync(tdSqlPath, 'utf8');
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
  console.log('🚀 开始执行信创工业综合治理平台 - 数据库一键初始化脚本');
  console.log('===================================================');

  await initMySQL();
  await initTDengine();

  console.log('\n🎉 所有数据库初始化任务结束！');
}

run();
