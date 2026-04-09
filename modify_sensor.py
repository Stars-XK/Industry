import os

path = '/workspace/frontend/src/views/governance/sensor.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sections match light mode
content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
# text-danger glow
content = content.replace('text-shadow: 0 0 10px var(--el-color-danger-light-5);', 'text-shadow: none;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated sensor.vue")
