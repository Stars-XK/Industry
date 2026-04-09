import pymysql

conn = mysql.connector.connect(
    host='139.224.26.134',
    user='Industry',
    password='nDTe2mNcSMadmY3S',
    database='Industry'
)

cursor = conn.cursor()
cursor.execute("SELECT id, parent_id, menu_name, path FROM sys_menu ORDER BY parent_id, sort_order")
for row in cursor.fetchall():
    print(row)

conn.close()