require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

const TD_HOST = process.env.TD_HOST || '139.224.26.134';
const TD_PORT = process.env.TD_PORT || '6041';
const TD_USER = process.env.TD_USER || 'root';
const TD_PASSWORD = process.env.TD_PASSWORD || 'taosdata';
const DB_NAME = process.env.TD_DB_NAME || 'industry_ts';

const client = axios.create({
  baseURL: `http://${TD_HOST}:${TD_PORT}/rest/sql`,
  headers: {
    Authorization: `Basic ${Buffer.from(`${TD_USER}:${TD_PASSWORD}`).toString('base64')}`
  },
  timeout: 5000,
});

async function pushToTDengine(sql) {
  try {
    const response = await client.post('', sql);
    console.log(`[Success] SQL Executed: ${sql.substring(0, 50)}...`);
  } catch (error) {
    console.error(`[Error] Failed to execute SQL: ${sql.substring(0, 50)}...`, error.message);
  }
}

// 模拟生成正弦波动压力值
function getSimulatedPressure(base, amplitude) {
  const time = Date.now() / 1000;
  return (base + Math.sin(time / 100) * amplitude + (Math.random() * 2 - 1)).toFixed(2);
}

// 模拟生成递增流量累计值
let currentFlow = 10000;
function getSimulatedFlow() {
  currentFlow += Math.random() * 5 + 1; // 每次递增 1-6 之间
  return currentFlow.toFixed(2);
}

console.log('--- 工业数据模拟器 (Data Simulator) 已启动 ---');
console.log(`正在向 TDengine [${TD_HOST}:${TD_PORT}] 定时推送数据...`);

// 每 10 秒推送一次设备原始数据 (模拟设备上报)
cron.schedule('*/10 * * * * *', async () => {
  const ts = new Date().toISOString().replace('T', ' ').replace('Z', '');
  
  // 模拟三个不同类型的测点数据
  const pressureVal = getSimulatedPressure(35, 5); // 基准35，振幅5
  const flowVal = getSimulatedFlow();
  const powerVal = (Math.random() * 10 + 220).toFixed(2); // 随机电压 220-230

  const sqls = [
    `INSERT INTO ${DB_NAME}.dev_p1 USING ${DB_NAME}.device_raw TAGS ('PRESS_01', 'DMA-001', 2) VALUES ('${ts}', ${pressureVal});`,
    `INSERT INTO ${DB_NAME}.dev_f1 USING ${DB_NAME}.device_raw TAGS ('FLOW_01', 'DMA-001', 1) VALUES ('${ts}', ${flowVal});`,
    `INSERT INTO ${DB_NAME}.dev_e1 USING ${DB_NAME}.device_raw TAGS ('ELEC_01', 'DMA-002', 3) VALUES ('${ts}', ${powerVal});`
  ];

  for (const sql of sqls) {
    await pushToTDengine(sql);
  }
});

// 每 5 分钟推送一次 DMA 聚合模拟数据
cron.schedule('*/5 * * * *', async () => {
  const ts = new Date().toISOString().replace('T', ' ').replace('Z', '');
  const supply = (Math.random() * 100 + 500).toFixed(2);
  const sale = (Math.random() * 80 + 400).toFixed(2);
  const balance = (supply - sale).toFixed(2);
  
  const sql = `INSERT INTO ${DB_NAME}.dma_5m_001 USING ${DB_NAME}.dma_5m TAGS ('DMA-001') VALUES ('${ts}', ${supply}, ${sale}, ${balance}, 0);`;
  await pushToTDengine(sql);
  console.log('[Info] DMA 5分钟聚合模拟数据推送完成');
});
