import os
import re
import glob

# Search directory
views_dir = '/workspace/frontend/src/views'
components_dir = '/workspace/frontend/src/components'

# All vue files
vue_files = glob.glob(os.path.join(views_dir, '**', '*.vue'), recursive=True) + \
            glob.glob(os.path.join(components_dir, '**', '*.vue'), recursive=True)

# Standard CSS to inject
standard_css = """
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar, .header-actions {
  display: flex;
  gap: 12px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}
"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If it's already refactored, skip
    if 'var(--el-bg-color-page)' in content and 'premium-container' not in content and 'dark-table' not in content:
        return

    original_content = content
    modified = False

    # 1. Replace class names in templates
    # premium-container -> app-container
    if 'premium-container' in content:
        content = content.replace('premium-container', 'app-container')
        modified = True
    
    # glass-panel hover-lift -> box-card (but note that box-card should ideally be el-card, we can just replace the class if it's div, or leave it. Actually, replacing `<div class="glass-panel hover-lift">` with `<el-card class="box-card">` requires matching closing tags. For simplicity, just `<div class="box-card">` will work if we define box-card styles.)
    if 'glass-panel' in content:
        content = re.sub(r'class="[^"]*glass-panel[^"]*"', 'class="box-card"', content)
        modified = True

    if 'dark-table' in content:
        content = content.replace('dark-table', 'custom-table')
        modified = True

    if 'neon-btn' in content:
        content = content.replace('neon-btn', '')
        modified = True

    if 'glass-btn' in content:
        content = content.replace('glass-btn', '')
        modified = True

    if 'dark-card' in content:
        content = content.replace('dark-card', 'box-card')
        modified = True

    if 'dark-form' in content:
        content = content.replace('dark-form', '')
        modified = True

    if 'glass-dialog' in content:
        content = content.replace('glass-dialog', '')
        modified = True

    if 'glass-input' in content:
        content = content.replace('glass-input', '')
        modified = True
        
    if 'glass-select' in content:
        content = content.replace('glass-select', '')
        modified = True

    if 'dark-radio-group' in content:
        content = content.replace('dark-radio-group', '')
        modified = True

    if 'glass-tree-container' in content:
        content = content.replace('glass-tree-container', 'tree-container')
        modified = True

    # 2. Update CSS
    if modified:
        # Check if <style scoped> exists
        if '<style scoped>' in content:
            # We want to replace the old dark styles with standard_css
            # But we should preserve other specific styles if any.
            # Actually, it's safer to just inject standard_css at the top of <style scoped>
            # and remove specific dark theme related blocks if possible, or just let them be overridden.
            # Let's remove the .page-header, .glass-*, .dark-* blocks using regex
            content = re.sub(r'\.page-header\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r'\.page-title\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r'\.page-subtitle\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r'\.glass-[a-zA-Z-]*\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r'\.dark-[a-zA-Z-]*\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r'\.neon-[a-zA-Z-]*\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r':deep\(\.glass-[a-zA-Z-]*\)[^{]*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r':deep\(\.dark-[a-zA-Z-]*\)[^{]*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r':deep\(\.el-table[^{]*\{[^}]*\}', '', content, flags=re.DOTALL) # remove custom table styles
            content = re.sub(r'\.action-btn\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            content = re.sub(r'\.action-btn:hover\s*\{[^}]*\}', '', content, flags=re.DOTALL)
            
            # Inject standard css
            content = content.replace('<style scoped>', '<style scoped>\n' + standard_css)
        else:
            # Add style block
            content += f'\n<style scoped>\n{standard_css}\n</style>\n'

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored: {filepath}")

for f in vue_files:
    process_file(f)

print("Done")
