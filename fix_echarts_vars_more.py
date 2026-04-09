import os
import re

directories = [
    '/workspace/frontend/src/views/analytics',
    '/workspace/frontend/src/views/governance',
    '/workspace/frontend/src/views/scada',
    '/workspace/frontend/src/views/system',
    '/workspace/frontend/src/views/workflow',
    '/workspace/frontend/src/views/dashboard'
]

replacements = {
    "'var(--el-text-color-secondary)'": "'#909399'",
    "'var(--el-border-color-extra-light)'": "'#f2f6fc'",
    "'var(--el-color-primary-light-8)'": "'rgba(59, 130, 246, 0.2)'",
    '"var(--el-text-color-secondary)"': "'#909399'",
    '"var(--el-border-color-extra-light)"': "'#f2f6fc'",
    '"var(--el-color-primary-light-8)"': "'rgba(59, 130, 246, 0.2)'"
}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<script setup' in content:
        script_start = content.find('<script setup')
        script_end = content.find('</script>', script_start)
        
        script_content = content[script_start:script_end]
        original_script_content = script_content
        
        for old, new in replacements.items():
            script_content = script_content.replace(old, new)
            
        if script_content != original_script_content:
            new_content = content[:script_start] + script_content + content[script_end:]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed MORE ECharts colors in {filepath}")

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.vue'):
                fix_file(os.path.join(root, f))
                
print("Done fixing more echarts vars.")
