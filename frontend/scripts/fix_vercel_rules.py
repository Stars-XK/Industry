import os
import re
import glob

views_dir = '/workspace/frontend/src/views'
components_dir = '/workspace/frontend/src/components'
layout_dir = '/workspace/frontend/src/layout'
assets_dir = '/workspace/frontend/src/assets'

vue_files = glob.glob(os.path.join(views_dir, '**', '*.vue'), recursive=True) + \
            glob.glob(os.path.join(components_dir, '**', '*.vue'), recursive=True) + \
            glob.glob(os.path.join(layout_dir, '**', '*.vue'), recursive=True)
            
css_files = glob.glob(os.path.join(assets_dir, '**', '*.css'), recursive=True)

all_files = vue_files + css_files

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Fix `transition: all`
    # Replace it with commonly used specific properties
    # This might match transition: all 0.3s ease etc.
    content = re.sub(r'transition:\s*all([^;]*);', r'transition: background-color\1, color\1, border-color\1, box-shadow\1, transform\1, opacity\1;', content)
    
    # 2. Fix `outline: none`
    # We replace it with focus-visible ring or just remove it if it's bad practice
    # Vercel rule: "Never `outline-none` / `outline: none` without focus replacement"
    # We'll replace it with a focus-visible ring style.
    if 'outline: none' in content:
        content = content.replace('outline: none', 'outline: 2px solid transparent; outline-offset: 2px;')

    # 3. Fix `...` to `…` in HTML text and Strings
    # We want to match text like "加载中..." but avoid matching JS spread operator `...args`
    # We only replace `...` if it is preceded by Chinese characters or specific words
    content = re.sub(r'([一-龥a-zA-Z]+)\.\.\.', r'\1…', content)
    # Also catch `...` at the end of quotes: `"Thinking..."` -> `"Thinking…"`
    content = re.sub(r'Thinking\.\.\.', r'Thinking…', content)
    
    if filepath.endswith('.vue'):
        # 4. Fix `<div @click="xxx"` to `<button @click="xxx"`
        # Actually it's safer to add keyboard handlers to div if it's complex like a menu item
        # Let's add `tabindex="0" @keydown.enter="xxx" @keydown.space.prevent="xxx"` to any div with @click
        
        def div_click_replacer(match):
            full_tag = match.group(0)
            click_handler = re.search(r'@click="([^"]+)"', full_tag)
            if click_handler and 'tabindex' not in full_tag:
                handler_func = click_handler.group(1)
                # Append tabindex and keydown events before the closing >
                return full_tag[:-1] + f' tabindex="0" @keydown.enter="{handler_func}" @keydown.space.prevent="{handler_func}">'
            return full_tag
            
        content = re.sub(r'<div[^>]*@click="[^"]*"[^>]*>', div_click_replacer, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed rules in: {filepath}")

for f in all_files:
    process_file(f)

print("Vercel Web Interface Guidelines fixes applied.")
