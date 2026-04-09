import os
import re

def check_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for dangling words in <style>
                style_match = re.search(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
                if style_match:
                    style_content = style_match.group(1)
                    # Find unclosed braces or dangling classes
                    lines = style_content.split('\n')
                    for i, line in enumerate(lines):
                        if re.match(r'^\s*\.[a-zA-Z0-9_-]+\s*$', line):
                            print(f"Warning: Dangling class {line} in {filepath}:{i+1}")
                        if "!" in line and "!important" not in line:
                            print(f"Warning: Suspicious ! in {filepath}:{i+1} -> {line}")
                        if ";" in line and re.search(r';\s*!important', line):
                            print(f"Warning: Bad !important syntax in {filepath}:{i+1} -> {line}")

if __name__ == '__main__':
    check_files('/workspace/frontend/src/views')
