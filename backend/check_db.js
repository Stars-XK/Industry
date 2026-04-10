const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '139.224.26.134',
    user: 'Industry',
    password: 'nDTe2mNcSMadmY3S',
    database: 'Industry'
  });
  
  const [sites] = await conn.execute('SELECT * FROM ast_site');
  console.log('--- SITES ---');
  console.log(sites);
  
  const [devices] = await conn.execute('SELECT * FROM ast_device');
  console.log('--- DEVICES ---');
  console.log(devices);

  const [points] = await conn.execute('SELECT * FROM ast_measuring_point');
  console.log('--- POINTS ---');
  console.log(points);
  
  const [zone] = await conn.execute('SELECT id, zone_name FROM dma_zone');
  console.log('--- ZONES ---');
  console.log(zone);
  
  await conn.end();
}

main().catch(console.error);
