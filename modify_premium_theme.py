import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix app-container width setting which was overriding my previous fix in some contexts
content = content.replace('.app-container {\n  padding: 24px;\n  background-color: var(--el-bg-color-page);\n  min-height: calc(100vh - 60px);\n  width: 50%;\n}', '.app-container {\n  padding: 24px;\n  background-color: var(--el-bg-color-page);\n  min-height: calc(100vh - 60px);\n  width: 100%;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css")
