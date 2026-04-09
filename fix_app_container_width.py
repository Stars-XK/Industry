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
            # remove width: 100%; from .app-container scoped blocks
            new_content = re.sub(r'width:\s*100%;\n?(\s*})', r'\1', content)
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
                
print("Done fixing width.")
