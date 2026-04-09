import os

path = '/workspace/frontend/src/views/governance/recipe.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure width is full in app container
content = content.replace('min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  }', 'min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;\n}')

# Fix table container background
content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated recipe.vue")
