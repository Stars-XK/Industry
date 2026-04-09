import os
import re

def replace_rgba(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace rgba(2, 6, 23, x) with var(--el-fill-color-light) or overlay
                new_content = re.sub(r'background:\s*rgba\(\s*2\s*,\s*6\s*,\s*23\s*,\s*0\.[0-9]+\s*\)', 'background: var(--el-bg-color-overlay)', content)
                new_content = re.sub(r'background-color:\s*rgba\(\s*2\s*,\s*6\s*,\s*23\s*,\s*0\.[0-9]+\s*\)', 'background-color: var(--el-bg-color-overlay)', new_content)
                new_content = re.sub(r'border:\s*[0-9]+px\s+solid\s*rgba\(\s*2\s*,\s*6\s*,\s*23\s*,\s*0\.[0-9]+\s*\)', 'border: 1px solid var(--el-border-color-light)', new_content)

                # Replace rgba(255, 255, 255, x) backgrounds
                new_content = re.sub(r'background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)', 'background: var(--el-fill-color-light)', new_content)
                new_content = re.sub(r'background-color:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)', 'background-color: var(--el-fill-color-light)', new_content)
                
                # Replace rgba(255, 255, 255, x) borders
                new_content = re.sub(r'border:\s*[0-9]+px\s+(solid|dashed)\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)', r'border: 1px \1 var(--el-border-color-light)', new_content)
                new_content = re.sub(r'border-(top|bottom|left|right):\s*[0-9]+px\s+(solid|dashed)\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)', r'border-\1: 1px \2 var(--el-border-color-light)', new_content)
                new_content = re.sub(r'border-color:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)', 'border-color: var(--el-border-color-light)', new_content)
                
                # Replace rgba(255, 255, 255, x) color
                new_content = re.sub(r'color:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[0-9]+\s*\)', 'color: var(--el-text-color-regular)', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed rgba in {filepath}")

if __name__ == '__main__':
    replace_rgba('/workspace/frontend/src/views')
