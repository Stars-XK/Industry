import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix height constraint in main-body to fill screen
content = content.replace('flex: 1;\n  display: flex;\n  position: relative;\n  z-index: 5;\n  overflow: hidden;', 'flex: 1;\n  display: flex;\n  position: relative;\n  z-index: 5;\n  overflow: hidden;\n  height: calc(100vh - 60px);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue")
