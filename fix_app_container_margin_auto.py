import os
import re

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Revert to margin: auto; to avoid scrollbar math issues
content = content.replace('  margin: 5vh auto;\n', '  margin: auto;\n')
content = content.replace('.app-container.wide-panel {\n  width: 90%;\n  height: 90%;\n  margin: 5vh auto;\n}', '.app-container.wide-panel {\n  width: 90%;\n  height: 90%;\n  margin: auto;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted to margin: auto")
