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
    box_card_pattern = r'\.box-card\s*\{[^}]*\}'
    
    new_box_card = """.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}"""
    
    content = re.sub(box_card_pattern, new_box_card, content)
    
    # ensure box-card hover state
    hover_pattern = r'\.box-card:hover\s*\{[^}]*\}'
    new_hover = """.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}"""
    if '.box-card:hover' in content:
        content = re.sub(hover_pattern, new_hover, content)
    else:
        # append to the end of style block
        if '</style>' in content:
            content = content.replace('</style>', new_hover + '\n</style>')
            
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
                
print("Done fixing box-card globally.")
