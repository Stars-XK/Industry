import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make app-main flex
content = content.replace('.app-main {\n  flex: 1;\n  padding: 20px;\n  position: relative;\n  pointer-events: auto;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 20px;\n  position: relative;\n  pointer-events: auto;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue app-main flex")
