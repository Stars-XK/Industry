const mysql = require('/workspace/backend/node_modules/mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: '139.224.26.134',
    user: 'Industry',
    password: 'nDTe2mNcSMadmY3S',
    database: 'Industry'
  });
  const [rows] = await conn.query('SELECT d.*, s.site_name FROM ast_device d LEFT JOIN ast_site s ON d.site_id = s.id WHERE d.status != 0 AND s.zone_id = 201');
  console.log(rows);
  conn.end();
}
run().catch(console.error);
