import * as mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection({
    host: '139.224.26.134',
    user: 'Industry',
    password: 'nDTe2mNcSMadmY3S',
    database: 'Industry'
  });
  
  const [rows] = await conn.query('SELECT id, parent_id, menu_name, path FROM sys_menu ORDER BY parent_id, sort_order');
  console.log(rows);
  await conn.end();
}
run();
