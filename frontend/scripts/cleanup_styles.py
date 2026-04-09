import os
import re
import glob

views_dir = '/workspace/frontend/src/views'
components_dir = '/workspace/frontend/src/components'
vue_files = glob.glob(os.path.join(views_dir, '**', '*.vue'), recursive=True) + \
            glob.glob(os.path.join(components_dir, '**', '*.vue'), recursive=True)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Remove hardcoded dark text colors
    content = re.sub(r'color:\s*#e2e8f0;?', 'color: var(--el-text-color-primary);', content)
    content = re.sub(r'color:\s*#94a3b8;?', 'color: var(--el-text-color-regular);', content)
    content = re.sub(r'color:\s*#00d8ff;?', 'color: var(--el-color-primary);', content)
    content = re.sub(r'color:\s*#10b981;?', 'color: var(--el-color-success);', content)
    content = re.sub(r'color:\s*#f43f5e;?', 'color: var(--el-color-danger);', content)
    
    # 2. Remove dark loading background
    content = re.sub(r'element-loading-background="[^"]+"', '', content)
    
    # 3. Clean up broken CSS selectors from previous pass
    # E.g. :deep(.) { ... }
    content = re.sub(r':deep\(\.\)\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # Remove any block starting with :deep(. or :deep(.-number that's broken
    content = re.sub(r':deep\(\.\s*\.el-[^{]*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r':deep\(\.-number[^{]*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r':deep\(\.\s*[^{]*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # Clean up empty class attributes class=""
    content = content.replace('class=""', '')
    content = content.replace("class=''", "")

    # Clean up broken .success-tag etc if they have hardcoded dark background
    content = re.sub(r'\.success-tag\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.danger-tag\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.warning-tag\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.dark-tag\s*\{[^}]*\}', '', content, flags=re.DOTALL)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned up: {filepath}")

for f in vue_files:
    process_file(f)

print("Done")
