import os
import re

def remove_table_overrides(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Remove --el-table... overrides
                new_content = re.sub(r'^\s*--el-table-header-bg-color:.*;\s*$', '', content, flags=re.MULTILINE)
                new_content = re.sub(r'^\s*--el-table-row-hover-bg-color:.*;\s*$', '', new_content, flags=re.MULTILINE)
                new_content = re.sub(r'^\s*--el-table-border-color:.*;\s*$', '', new_content, flags=re.MULTILINE)
                
                if new_content != content:
                    # Clean up empty lines created
                    new_content = re.sub(r'\n\s*\n', '\n', new_content)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Removed table overrides in {filepath}")

if __name__ == '__main__':
    remove_table_overrides('/workspace/frontend/src/views')
