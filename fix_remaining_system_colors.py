import os
import re

directories = [
    '/workspace/frontend/src/views/system'
]

def fix_css(content):
    replacements = {
        '#f43f5e': 'var(--el-color-danger)',
        'rgba(244, 63, 94, 0.1)': 'var(--el-color-danger-light-9)',
        'rgba(244, 63, 94, 0.3)': 'var(--el-color-danger-light-7)',
        '#eab308': 'var(--el-color-warning)',
        'rgba(234, 179, 8, 0.1)': 'var(--el-color-warning-light-9)',
        'rgba(234, 179, 8, 0.3)': 'var(--el-color-warning-light-7)',
        'rgba(16, 185, 129, 0.4)': 'var(--el-color-success-light-6)',
        'rgba(239, 68, 68, 0.4)': 'var(--el-color-danger-light-6)',
        'rgba(245, 158, 11, 0.4)': 'var(--el-color-warning-light-6)',
        'rgba(59, 130, 246, 0.4)': 'var(--el-color-primary-light-6)',
        'rgba(0, 0, 0, 0.4)': 'var(--el-bg-color-overlay)',
        'rgba(0,0,0,0.2)': 'var(--el-box-shadow-light)',
        'rgba(0,0,0,0.3)': 'var(--el-box-shadow)'
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
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
                
print("Done fixing remaining system colors.")
