const mysql = require('mysql2/promise');

const MYSQL_CONFIG = {
  host: process.env.DB_HOST || '139.224.26.134',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'Industry',
  password: process.env.DB_PWD || 'nDTe2mNcSMadmY3S',
  database: process.env.DB_NAME || 'Industry'
};

async function main() {
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  try {
    await connection.query("ALTER TABLE dma_zone ADD COLUMN zone_code VARCHAR(50) NULL COMMENT '分区唯一编码' AFTER parent_id;");
    console.log("Successfully added zone_code to dma_zone");
  } catch(e) {
    console.log("Maybe already added or error:", e.message);
  }
  await connection.end();
}
main();
