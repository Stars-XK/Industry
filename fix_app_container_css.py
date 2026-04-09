import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Revert app-container height modification to make it fill the main panel
content = content.replace('height: 100%;', 'min-height: 100%;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css app-container min-height")
