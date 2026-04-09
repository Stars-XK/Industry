import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function updateGisMenu() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '139.224.26.134',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'Industry',
    password: process.env.DB_PWD || 'nDTe2mNcSMadmY3S',
    database: process.env.DB_NAME || 'Industry',
  });

  try {
    const [result] = await connection.execute(
      "UPDATE sys_menu SET visible = 0, remark = '测试隐藏的GIS菜单' WHERE path = 'gis';"
    );
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error updating menu:', error);
  } finally {
    await connection.end();
  }
}

updateGisMenu();