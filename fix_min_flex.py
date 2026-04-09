import os
import re

directories = [
    '/workspace/frontend/src/views/analytics',
    '/workspace/frontend/src/views/governance',
    '/workspace/frontend/src/views/scada',
    '/workspace/frontend/src/views/system',
    '/workspace/frontend/src/views/workflow'
]

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.vue'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                content = content.replace('  min-flex: 1;\n', '')
                
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                
print("Removed invalid min-flex CSS")
