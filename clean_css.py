import os
import re

DIR = 'frontend/src/views'
LAYOUT_DIR = 'frontend/src/layout'

# Target classes that we want to remove from local <style> tags
# because they are now globally provided in premium-theme.css
CLASSES = [
    r'\.premium-container',
    r'\.glass-panel',
    r'\.neon-btn',
    r'\.glass-btn',
    r'\.dark-table',
    r'\.status-dot',
    r'\.dark-input',
    r'\.glass-dialog',
    r':deep\(\.page-container\)',
    r'\.page-container'
]

def clean_css(content):
    for cls in CLASSES:
        # Match class and its pseudo-classes/descendants until { ... }
        # This matches:
        # .classname { ... }
        # .classname:hover { ... }
        # .classname .child { ... }
        # :deep(.page-container) { ... }
        pattern = cls + r'(?:\s|:|\.|>|~|\+)[^{]*\{[^{}]*\}|' + cls + r'\s*\{[^{}]*\}'
        
        # We might need to run it multiple times if there are multiple occurrences
        prev_content = None
        while content != prev_content:
            prev_content = content
            content = re.sub(pattern, '', content)
    return content

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                style_match = re.search(r'(<style[^>]*>)(.*?)(</style>)', content, re.DOTALL)
                if style_match:
                    style_open = style_match.group(1)
                    style_content = style_match.group(2)
                    style_close = style_match.group(3)

                    cleaned_style = clean_css(style_content)
                    
                    # Remove empty lines
                    cleaned_style = re.sub(r'\n\s*\n', '\n', cleaned_style)

                    if not cleaned_style.strip():
                        # Remove the entire style block if empty
                        new_content = content.replace(style_match.group(0), '')
                    else:
                        new_content = content.replace(
                            style_match.group(0), 
                            style_open + '\n' + cleaned_style.strip() + '\n' + style_close
                        )

                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Cleaned CSS in {path}")

process_directory(DIR)
process_directory(LAYOUT_DIR)
print("CSS Cleanup Done.")
