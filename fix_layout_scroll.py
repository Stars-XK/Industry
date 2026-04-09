import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make main-container scrollable
content = content.replace('.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n}', '.main-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  pointer-events: auto;\n  overflow-y: auto;\n  overflow-x: hidden;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue to enable scrolling")
