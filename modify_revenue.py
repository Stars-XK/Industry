import os

path = '/workspace/frontend/src/views/governance/revenue.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure width is full in app container
content = content.replace('min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  }', 'min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;\n}')

# Improve background colors
content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
content = content.replace('background: var(--el-color-danger-light-9);', 'background: var(--el-color-danger-light-9);')
content = content.replace('box-shadow: inset 0 0 20px var(--el-color-danger-light-9);', 'box-shadow: none;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated revenue.vue")
