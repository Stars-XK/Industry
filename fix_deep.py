import os
import re

DIR = 'frontend/src/views'

def fix_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Remove lines that are exactly `:deep(` possibly surrounded by whitespace
                new_content = re.sub(r'^\s*:deep\(\s*$\n?', '', content, flags=re.MULTILINE)
                
                # Also remove `:deep() { ... }` or similar broken blocks just in case
                new_content = re.sub(r':deep\(\)\s*\{[^{}]*\}', '', new_content)

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed broken :deep( in {path}")

fix_directory(DIR)
print("Done.")
