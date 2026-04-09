import os
import re

def fix_hardcoded_colors(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace hardcoded dark mode backgrounds
                new_content = re.sub(r'background:\s*rgba\(\s*15\s*,\s*23\s*,\s*42\s*,\s*0\.[0-9]+\s*\)', 'background: var(--el-bg-color-overlay)', content)
                new_content = re.sub(r'background-color:\s*rgba\(\s*15\s*,\s*23\s*,\s*42\s*,\s*0\.[0-9]+\s*\)', 'background-color: var(--el-bg-color-overlay)', new_content)
                new_content = re.sub(r'background:\s*#0f172a', 'background: var(--el-bg-color)', new_content)
                new_content = re.sub(r'background-color:\s*#0f172a', 'background-color: var(--el-bg-color)', new_content)
                new_content = re.sub(r'background:\s*#020617', 'background: var(--el-bg-color-page)', new_content)
                new_content = re.sub(r'background-color:\s*#020617', 'background-color: var(--el-bg-color-page)', new_content)
                new_content = re.sub(r'background:\s*#1e293b', 'background: var(--el-fill-color-light)', new_content)
                new_content = re.sub(r'background-color:\s*#1e293b', 'background-color: var(--el-fill-color-light)', new_content)
                
                # Replace hardcoded borders
                new_content = re.sub(r'border:\s*1px\s*solid\s*rgba\(\s*148\s*,\s*163\s*,\s*184\s*,\s*0\.[0-9]+\s*\)', 'border: 1px solid var(--el-border-color-light)', new_content)
                new_content = re.sub(r'border-color:\s*rgba\(\s*148\s*,\s*163\s*,\s*184\s*,\s*0\.[0-9]+\s*\)', 'border-color: var(--el-border-color-light)', new_content)
                new_content = re.sub(r'border-top:\s*1px\s*solid\s*rgba\(\s*148\s*,\s*163\s*,\s*184\s*,\s*0\.[0-9]+\s*\)', 'border-top: 1px solid var(--el-border-color-light)', new_content)
                new_content = re.sub(r'border-bottom:\s*1px\s*solid\s*rgba\(\s*148\s*,\s*163\s*,\s*184\s*,\s*0\.[0-9]+\s*\)', 'border-bottom: 1px solid var(--el-border-color-light)', new_content)
                
                # Colors
                new_content = re.sub(r'color:\s*#94a3b8', 'color: var(--el-text-color-secondary)', new_content)
                new_content = re.sub(r'color:\s*#cbd5e1', 'color: var(--el-text-color-regular)', new_content)
                new_content = re.sub(r'color:\s*#f8fafc', 'color: var(--el-text-color-primary)', new_content)
                new_content = re.sub(r'color:\s*#fff', 'color: var(--el-text-color-primary)', new_content)
                new_content = re.sub(r'color:\s*#00d8ff', 'color: var(--el-color-primary)', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed colors in {filepath}")

if __name__ == '__main__':
    fix_hardcoded_colors('/workspace/frontend/src/views')
