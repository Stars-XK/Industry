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
    for f in os.listdir(d):
        if f.endswith('.vue'):
            path = os.path.join(d, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            # Replace hardcoded calc heights with flex
            content = content.replace('height: calc(100vh - 60px);', 'flex: 1;')
            content = content.replace('min-height: calc(100vh - 60px);', 'flex: 1;')
            content = content.replace('min-height: calc(100vh - 100px);', 'flex: 1;')
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
                
print("Done fixing all vue heights to flex: 1")
