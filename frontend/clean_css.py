import os
import re

def clean_css_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace dangling .custom-scrollbar
                new_content = re.sub(r'^\s*\.custom-scrollbar\s*$', '', content, flags=re.MULTILINE)
                new_content = re.sub(r'^\s*\.custom-scrollbar\s*\n', '\n', new_content, flags=re.MULTILINE)
                new_content = re.sub(r'\.danger-\s*\{', '.danger-btn {', new_content)
                new_content = re.sub(r'\.danger-:hover', '.danger-btn:hover', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Cleaned {filepath}")

if __name__ == '__main__':
    clean_css_files('/workspace/frontend/src/views')
