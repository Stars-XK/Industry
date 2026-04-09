import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change .app-container width to min-width so it can expand horizontally if needed, or remove width
content = content.replace('width: 100%;', 'box-sizing: border-box;\n  width: 100%;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css")
