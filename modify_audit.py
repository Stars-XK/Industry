import os

path = '/workspace/frontend/src/views/system/audit.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make json-viewer match light mode better
content = content.replace('background-color: var(--el-bg-color-overlay);', 'background-color: var(--el-fill-color-blank);')
# pre color
content = content.replace('color: var(--el-color-success);', 'color: var(--el-text-color-primary);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated audit.vue")
