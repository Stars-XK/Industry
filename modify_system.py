import os
import re

directories = [
    '/workspace/frontend/src/views/system'
]

def fix_css(content):
    # Fix the missing width: 100% in app-container if any
    content = content.replace('min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  }', 'min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;\n}')

    # For table container box-card
    content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
    return content

for d in directories:
    if not os.path.exists(d): continue
    for f in os.listdir(d):
        if f.endswith('.vue'):
            path = os.path.join(d, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            new_content = fix_css(content)
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
                
print("Done fixing system pages.")
