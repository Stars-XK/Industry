import os
import re

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Remove generic console.error(error) or console.error(e) 
                # leaving the catch block empty if it only had that.
                new_content = re.sub(r'^\s*console\.error\([^\)]+\)\s*;?\n?', '', content, flags=re.MULTILINE)
                
                # If catch(e) { } became empty, keep it but no console.error
                new_content = re.sub(r'catch\s*\([^)]*\)\s*\{\s*\}', 'catch (e) { /* fallback */ }', new_content)

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Removed console.error in {path}")

process_directory('frontend/src/views')
print("Done.")
