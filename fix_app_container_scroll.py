import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify .app-container to explicitly handle overflow and be the scrollable element if needed, 
# or ensure it fits exactly in the parent and lets the parent scroll.
# Actually, the prompt says: "右侧面板应该固定高度，固定宽度，然后超出高度要给面板增加滚动条"
# So the main-container or app-container should be fixed height and scrollable.

content = content.replace('.app-container {\n  padding: 24px;\n  background-color: var(--el-bg-color-page);\n  min-height: calc(100vh - 100px);\n  box-sizing: border-box;\n  width: 100%;\n}', '.app-container {\n  padding: 24px;\n  background-color: var(--el-bg-color-page);\n  height: 100%;\n  box-sizing: border-box;\n  width: 100%;\n  overflow-y: auto;\n  overflow-x: hidden;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css app-container")
