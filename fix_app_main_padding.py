import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add padding to app-main just to be safe, so if margin: auto fails, padding keeps it off the edge.
content = content.replace('.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 5vh 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  box-sizing: border-box;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue with padding")
