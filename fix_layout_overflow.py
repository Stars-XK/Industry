import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make main-container fixed and not scrollable, app-main fixed and not scrollable, so that app-container handles the scroll
content = content.replace('.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow-y: auto;\n  overflow-x: auto;\n}', '.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}')

content = content.replace('.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 20px;\n  position: relative;\n  pointer-events: auto;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue overflow settings")
