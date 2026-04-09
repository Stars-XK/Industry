import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add margin: auto; to .app-container to guarantee it's centered in its flex parent
content = content.replace('  width: 50%;  /* Default width 50% */\n  box-sizing: border-box;', '  width: 50%;  /* Default width 50% */\n  margin: auto;\n  box-sizing: border-box;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css with margin: auto")
