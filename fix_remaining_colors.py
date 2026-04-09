import os
import re

directories = [
    '/workspace/frontend/src/views'
]

def fix_css(content):
    replacements = {
        '#F56C6C': 'var(--el-color-danger)',
        '#E6A23C': 'var(--el-color-warning)',
        '#67C23A': 'var(--el-color-success)',
        '#909399': 'var(--el-color-info)',
        'rgba(245, 108, 108, 0.2)': 'var(--el-color-danger-light-8)',
        'rgba(245, 108, 108, 0.02)': 'var(--el-color-danger-light-9)',
        'rgba(245, 108, 108, 0.05)': 'var(--el-color-danger-light-9)',
        'rgba(245, 108, 108, 0.1)': 'var(--el-color-danger-light-9)',
        'rgba(245, 108, 108, 0.5)': 'var(--el-color-danger-light-5)',
        'rgba(230, 162, 60, 0.05)': 'var(--el-color-warning-light-9)',
        'rgba(230, 162, 60, 0.2)': 'var(--el-color-warning-light-8)',
        'rgba(103, 194, 58, 0.05)': 'var(--el-color-success-light-9)',
        'rgba(103, 194, 58, 0.2)': 'var(--el-color-success-light-8)',
        '#64748b': 'var(--el-border-color)',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    return content

for root, dirs, files in os.walk(directories[0]):
    for f in files:
        if f.endswith('.vue'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            new_content = fix_css(content)
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
                
print("Done fixing remaining hardcoded colors.")
