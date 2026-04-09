import os
import re

directories = [
    '/workspace/frontend/src/views/analytics',
    '/workspace/frontend/src/views/governance',
    '/workspace/frontend/src/views/scada',
    '/workspace/frontend/src/views/system',
    '/workspace/frontend/src/views/workflow'
]

def fix_css(content):
    # Match any .app-container { ... }
    # Also handle some edge cases if needed.
    
    app_container_pattern = r'\.app-container\s*\{[^}]*\}'
    
    new_app_container = """.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}"""
    
    content = re.sub(app_container_pattern, new_app_container, content)
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
                
print("Done fixing app-container widths globally.")
