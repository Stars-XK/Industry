const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '139.224.26.134',
    user: 'Industry',
    password: 'nDTe2mNcSMadmY3S',
    database: 'Industry',
    connectTimeout: 20000,
    multipleStatements: true
  });
  
  console.log('Connected to database.');

  // dma_zone changes
  try { await conn.execute(`ALTER TABLE dma_zone ADD COLUMN boundary_gis JSON COMMENT '分区多边形边界(GeoJSON格式)'`); console.log('dma_zone boundary_gis added'); } catch(e){ console.log(e.message); }
  try { await conn.execute(`ALTER TABLE dma_zone ADD COLUMN center_lng DECIMAL(10, 6) COMMENT '中心点经度'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE dma_zone ADD COLUMN center_lat DECIMAL(10, 6) COMMENT '中心点纬度'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE dma_zone ADD COLUMN crs VARCHAR(20) DEFAULT 'CGCS2000' COMMENT '坐标系: CGCS2000/WGS84/GCJ02'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE dma_zone ADD COLUMN properties JSON COMMENT '扩展属性'`); } catch(e){}
  
  // ast_site changes
  try { await conn.execute(`ALTER TABLE ast_site ADD COLUMN lng DECIMAL(10, 6) COMMENT '经度'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_site ADD COLUMN lat DECIMAL(10, 6) COMMENT '纬度'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_site ADD COLUMN crs VARCHAR(20) DEFAULT 'CGCS2000' COMMENT '坐标系'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_site ADD COLUMN properties JSON COMMENT '扩展属性'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_site DROP COLUMN gis_coord`); } catch(e){}

  // ast_device changes
  try { await conn.execute(`ALTER TABLE ast_device ADD COLUMN lng DECIMAL(10, 6) COMMENT '经度'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_device ADD COLUMN lat DECIMAL(10, 6) COMMENT '纬度'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_device ADD COLUMN crs VARCHAR(20) DEFAULT 'CGCS2000' COMMENT '坐标系'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_device ADD COLUMN manufacturer VARCHAR(100) COMMENT '生产厂家'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_device ADD COLUMN model VARCHAR(100) COMMENT '规格型号'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_device ADD COLUMN properties JSON COMMENT '扩展属性'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_device DROP COLUMN gis_coord`); } catch(e){}

  // ast_measuring_point changes
  try { await conn.execute(`ALTER TABLE ast_measuring_point ADD COLUMN range_min DECIMAL(10, 2) COMMENT '量程下限'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_measuring_point ADD COLUMN range_max DECIMAL(10, 2) COMMENT '量程上限'`); } catch(e){}
  try { await conn.execute(`ALTER TABLE ast_measuring_point ADD COLUMN properties JSON COMMENT '扩展属性'`); } catch(e){}

  console.log('Database schema updated successfully.');
  await conn.end();
}

main().catch(console.error);