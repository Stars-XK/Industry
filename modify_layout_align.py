import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Since we are using margins (5vh 5% and 5vh 45%), we don't want flex align-items: center and justify-content: center.
# We want them to just position normally so margins can work.
content = content.replace('.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  height: 100%;\n}', '.app-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n  position: relative;\n  pointer-events: auto;\n  overflow: hidden;\n  height: 100%;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue removed align/justify center")
