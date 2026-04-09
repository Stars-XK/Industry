import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Instead of putting scrollbar on app-container, let's put it on main-container as originally intended
# because app-main acts as a wrapper for router-view
content = content.replace('.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}', '.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow-y: auto;\n  overflow-x: hidden;\n}')

content = content.replace('.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed layout scroll on main-container")
