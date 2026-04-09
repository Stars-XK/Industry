import os

path = '/workspace/frontend/src/views/analytics/mnf.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure width is full in app container
content = content.replace('min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  }', 'min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;\n}')

# Fix warning banner colors to match light mode cleanly
content = content.replace('background: var(--el-color-warning-light-9);', 'background: var(--el-color-warning-light-9);')

# Make sure chart is responsive and no hardcoded height if possible
# Or keep height 460px but allow flex

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated mnf.vue")
