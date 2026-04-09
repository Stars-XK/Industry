import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove min-height: calc(100vh - 140px); from .box-card
content = content.replace('.box-card {\n  min-height: calc(100vh - 140px);\n  display: flex;\n  flex-direction: column;\n}', '.box-card {\n  display: flex;\n  flex-direction: column;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed box-card global min-height")
