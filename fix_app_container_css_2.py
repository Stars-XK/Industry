import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# remove overflow from app-container so it just stretches
content = content.replace('  overflow-y: auto;\n  overflow-x: hidden;\n', '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed overflow from app-container")
