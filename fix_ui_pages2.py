import os
import re

directories = [
    '/workspace/frontend/src/views/analytics',
    '/workspace/frontend/src/views/scada'
]

def fix_css(content):
    if '.industrial-form' in content:
        content = re.sub(r'\.industrial-form\s*\{', '', content)
        
    content = content.replace('!important', '')
    
    replacements = {
        '#0f172a': 'var(--el-bg-color)',
        '#1e293b': 'var(--el-bg-color-overlay)',
        '#334155': 'var(--el-border-color-lighter)',
        '#475569': 'var(--el-border-color-light)',
        '#94a3b8': 'var(--el-text-color-secondary)',
        '#cbd5e1': 'var(--el-text-color-regular)',
        '#f8fafc': 'var(--el-text-color-primary)',
        '#00d8ff': 'var(--el-color-primary)',
        '#00a3cc': 'var(--el-color-primary-dark-2)',
        'rgba(15, 23, 42, 0.8)': 'var(--el-bg-color-overlay)',
        'rgba(0, 216, 255, 0.1)': 'var(--el-color-primary-light-9)',
        'rgba(0, 216, 255, 0.2)': 'var(--el-color-primary-light-8)',
        'rgba(30, 41, 59, 0.8)': 'var(--el-bg-color-overlay)',
        'rgba(255, 255, 255, 0.1)': 'var(--el-border-color-lighter)',
        'rgba(255, 255, 255, 0.05)': 'var(--el-fill-color-light)',
        'rgba(0, 0, 0, 0.2)': 'var(--el-box-shadow-light)',
        'rgba(0, 0, 0, 0.3)': 'var(--el-box-shadow)',
        'rgba(16, 185, 129, 0.1)': 'var(--el-color-success-light-9)',
        'rgba(239, 68, 68, 0.1)': 'var(--el-color-danger-light-9)',
        'rgba(245, 158, 11, 0.1)': 'var(--el-color-warning-light-9)',
        '#10b981': 'var(--el-color-success)',
        '#ef4444': 'var(--el-color-danger)',
        '#f59e0b': 'var(--el-color-warning)',
        '#3b82f6': 'var(--el-color-primary)',
        '#8b5cf6': 'var(--el-color-primary)',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    content = re.sub(r'rgba\(0,\s*216,\s*255,\s*0\.\d+\)', 'var(--el-color-primary-light-8)', content)
    
    if '.box-card {' in content:
        if 'display: flex' not in content[content.find('.box-card {'):content.find('}', content.find('.box-card {'))]:
            content = content.replace('.box-card {', '.box-card {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  background: var(--el-bg-color);\n  border: 1px solid var(--el-border-color-light);\n')
            
    if '.app-container {' in content:
        if 'display: flex' not in content[content.find('.app-container {'):content.find('}', content.find('.app-container {'))]:
             content = content.replace('.app-container {', '.app-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n')
             
    content = content.replace('background-color: transparent', 'background-color: var(--el-fill-color-blank)')
    content = content.replace('background: transparent', 'background: var(--el-fill-color-blank)')
    
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
                
print("Done fixing scada and analytics pages.")
