import os
import re

def update_energy():
    path = '/workspace/frontend/src/views/analytics/energy.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # fix danger-tag, warning-tag, success-tag definitions missing in energy.vue
    if '.success-tag' not in content:
        styles_to_add = """
.success-tag { background-color: var(--el-color-success-light-9); color: var(--el-color-success); font-weight: bold; }
.warning-tag { background-color: var(--el-color-warning-light-9); color: var(--el-color-warning); font-weight: bold; }
.danger-tag { background-color: var(--el-color-danger-light-9); color: var(--el-color-danger); font-weight: bold; }
"""
        content = content.replace('</style>', styles_to_add + '</style>')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_all_buttons():
    directories = ['/workspace/frontend/src/views']
    for root, dirs, files in os.walk(directories[0]):
        for f in files:
            if f.endswith('.vue'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # If there are old hardcoded custom classes on el-buttons, remove them
                # But since we just want to ensure clean UI, let's verify there are no empty class attributes
                content = re.sub(r'class="\s*"', '', content)
                
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)

update_energy()
fix_all_buttons()
print("Cleaned up remaining components.")
