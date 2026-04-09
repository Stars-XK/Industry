import os

path = '/workspace/frontend/src/views/analytics/key-account.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update .table-container
content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
# Update .logic-text
content = content.replace('background: var(--el-fill-color-light);', 'background: var(--el-fill-color-lighter);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated key-account.vue")
