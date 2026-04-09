import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change min-height to account for the 20px padding top/bottom in .app-main
content = content.replace('min-height: calc(100vh - 60px);', 'min-height: calc(100vh - 100px);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css min-height")
