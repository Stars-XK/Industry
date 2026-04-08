import os
import re

DIR = 'frontend/src'

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace completely empty <style scoped></style>
                new_content = re.sub(r'<style scoped>\s*</style>', '', content)
                new_content = re.sub(r'<style>\s*</style>', '', new_content)
                
                # Also remove leading/trailing empty lines at the end of file
                new_content = new_content.strip() + '\n'

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Cleaned empty style in {path}")

process_directory(DIR)
print("Empty style cleanup done.")
