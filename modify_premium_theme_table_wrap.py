import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the forced white-space: nowrap
content = content.replace('''/* Force tables to scroll horizontally instead of wrapping text into tall, ugly rows */
.el-table .cell {
  white-space: nowrap !important;
  word-break: keep-all !important;
  text-overflow: ellipsis;
  overflow: hidden;
}''', '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed forced table no-wrap")
