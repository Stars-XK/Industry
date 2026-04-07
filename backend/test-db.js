const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: '139.224.26.134',
  user: 'Industry',
  password: 'nDTe2mNcSMadmY3S',
  database: 'Industry'
});
connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
  connection.end();
});
