import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make app-main explicitly 100% height
content = content.replace('.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 5vh 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  box-sizing: border-box;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  height: 100%;\n}')

# Make main-container explicitly 100% height too
content = content.replace('.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}', '.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  height: 100%;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue with height: 100%")
