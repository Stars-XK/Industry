import os
import re

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace margin: auto; with margin: 5vh auto;
content = content.replace('  margin: auto;\n', '  margin: 5vh auto;\n')

# Ensure we have the correct height and margin for wide-panel too.
# Wide panel will also use margin: 5vh auto; because 90% height + 5vh top + 5vh bottom = 100%
content = content.replace('.app-container.wide-panel {\n  width: 90%;\n  height: 90%;\n}', '.app-container.wide-panel {\n  width: 90%;\n  height: 90%;\n  margin: 5vh auto;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css with margin: 5vh auto")
