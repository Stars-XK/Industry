import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make app-main align and justify center
content = content.replace('.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}')

# Make main-container not scrollable, app-main is not scrollable.
content = content.replace('.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow-y: auto;\n  overflow-x: hidden;\n}', '.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue flex alignment")
