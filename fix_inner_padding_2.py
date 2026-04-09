import os
import re

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('padding: 2%; /* 2% padding inside the panel */', 'padding: 24px;')
content = content.replace('  padding: 2%;\n}', '}\n')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted inner padding to 24px")
