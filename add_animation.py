import os

DIR = 'frontend/src/views'

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    original_content = f.read()
                
                content = original_content

                if 'class="premium-container"' in content:
                    content = content.replace('class="premium-container"', 'class="premium-container fade-in-up"')
                elif 'class="premium-container ' in content and 'fade-in-up' not in content:
                    content = content.replace('class="premium-container ', 'class="premium-container fade-in-up ')

                if 'class="glass-panel"' in content:
                    content = content.replace('class="glass-panel"', 'class="glass-panel hover-lift"')
                elif 'class="glass-panel ' in content and 'hover-lift' not in content:
                    content = content.replace('class="glass-panel ', 'class="glass-panel hover-lift ')

                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Added animations in {path}")

process_directory(DIR)
print("Animation effects applied.")
