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
    # Gradients and arrays (where CanvasGradient or similar is used)
    "'var(--el-color-primary-light-5)'": "'rgba(59, 130, 246, 0.5)'",
    "'var(--el-color-warning-light-5)'": "'rgba(230, 162, 60, 0.5)'",
    "'var(--el-color-success-light-5)'": "'rgba(16, 185, 129, 0.5)'",
    "'var(--el-color-danger-light-5)'": "'rgba(239, 68, 68, 0.5)'",
    "'var(--el-color-primary)'": "'#3b82f6'",
    "'var(--el-color-success)'": "'#10b981'",
    "'var(--el-color-warning)'": "'#f59e0b'",
    "'var(--el-color-danger)'": "'#ef4444'",
    "'var(--el-bg-color-overlay)'": "'rgba(255, 255, 255, 0.9)'",
    "'var(--el-border-color-light)'": "'#e4e7ed'",
    "'var(--el-text-color-primary)'": "'#303133'",
    "'var(--el-text-color-regular)'": "'#606266'",
    "'var(--el-border-color-darker)'": "'#c0c4cc'",
    "'var(--el-bg-color)'": "'#ffffff'",
    '"var(--el-color-primary-light-5)"': "'rgba(59, 130, 246, 0.5)'",
    '"var(--el-color-warning-light-5)"': "'rgba(230, 162, 60, 0.5)'",
    '"var(--el-color-success-light-5)"': "'rgba(16, 185, 129, 0.5)'",
    '"var(--el-color-danger-light-5)"': "'rgba(239, 68, 68, 0.5)'",
    '"var(--el-color-primary)"': "'#3b82f6'",
    '"var(--el-color-success)"': "'#10b981'",
    '"var(--el-color-warning)"': "'#f59e0b'",
    '"var(--el-color-danger)"': "'#ef4444'"
}

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We only want to replace inside <script setup> block to not break CSS
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
            print(f"Fixed ECharts colors in {filepath}")

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.vue'):
                fix_file(os.path.join(root, f))
                
print("Done fixing echarts vars.")
