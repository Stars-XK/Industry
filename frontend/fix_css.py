import os
import re

def fix_css_errors(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = re.sub(r'\.industrial-form\s*$', '', content, flags=re.MULTILINE)
                new_content = re.sub(r'color:\s*(var\([^)]+\));\s*!important;', r'color: \1 !important;', new_content)
                new_content = re.sub(r'\.industrial-form\s*\n\s*</style>', r'</style>', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {filepath}")

if __name__ == '__main__':
    fix_css_errors('/workspace/frontend/src/views')
