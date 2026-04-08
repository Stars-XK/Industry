import os
import re

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Extract script block
                script_match = re.search(r'<script.*?>\n(.*?)\n</script>', content, re.DOTALL)
                if not script_match:
                    continue
                
                script_content = script_match.group(1)
                new_script_content = script_content
                
                # Check for vue imports like `import { ref, reactive, onMounted } from 'vue'`
                vue_import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]vue['\"]", script_content)
                if vue_import_match:
                    imports_str = vue_import_match.group(1)
                    imports = [i.strip() for i in imports_str.split(',')]
                    used_imports = []
                    for imp in imports:
                        if not imp: continue
                        # Remove it temporarily to check if it's used elsewhere
                        temp_script = new_script_content.replace(vue_import_match.group(0), '')
                        # Check if the import name is used as a whole word in script or template
                        if re.search(r'\b' + imp + r'\b', temp_script) or re.search(r'\b' + imp + r'\b', content.replace(script_content, '')):
                            used_imports.append(imp)
                    
                    if len(used_imports) == 0:
                        new_script_content = new_script_content.replace(vue_import_match.group(0), '')
                    elif len(used_imports) != len(imports):
                        new_imports_str = ', '.join(used_imports)
                        new_script_content = new_script_content.replace(vue_import_match.group(0), f"import {{ {new_imports_str} }} from 'vue'")

                if new_script_content != script_content:
                    content = content.replace(script_content, new_script_content)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Cleaned unused Vue imports in {path}")

process_directory('frontend/src')
print("Import cleanup done.")
