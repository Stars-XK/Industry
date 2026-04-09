import os
import re

directories = [
    '/workspace/frontend/src/views/analytics',
    '/workspace/frontend/src/views/governance',
    '/workspace/frontend/src/views/scada',
    '/workspace/frontend/src/views/system',
    '/workspace/frontend/src/views/workflow',
    '/workspace/frontend/src/views/dashboard'
]

# All pages that should NOT be 50% width
# Based on the user's prompt, the remaining are 90% width.
# List of 90% wide pages from user's exclusion list:
wide_pages = [
    'dashboard/index.vue',
    'scada/overview.vue',
    'scada/hmi.vue',
    'scada/security.vue',
    'analytics/nrw.vue',
    'analytics/mnf.vue',
    'scada/gis.vue', # Assuming GIS is not DMA config
]

# We need to find `.app-container` or `.dashboard-container` and add `wide-panel` class.
for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.vue'):
                filepath = os.path.join(root, f)
                rel_path = os.path.relpath(filepath, '/workspace/frontend/src/views/')
                
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Check if it should be wide
                is_wide = False
                for w in wide_pages:
                    if w in rel_path.replace('\\', '/'):
                        is_wide = True
                        break
                
                if is_wide:
                    content = content.replace('class="app-container"', 'class="app-container wide-panel"')
                    content = content.replace('class="dashboard-container"', 'class="app-container wide-panel"')
                else:
                    # Remove wide-panel if it accidentally has it
                    content = content.replace('class="app-container wide-panel"', 'class="app-container"')
                    content = content.replace('class="dashboard-container"', 'class="app-container"')

                # Make sure the container has no hardcoded 100% width or min-height 100vh if they override the global CSS
                # We already removed hardcoded widths, but let's be sure we don't have style="width: 100%;"
                # Some files have width: 100% in their <style> block overriding premium-theme.
                # Let's remove specific overriding from all files.
                content = re.sub(r'\.app-container\s*\{[^}]*width:\s*100%;[^}]*\}', '', content)
                content = re.sub(r'\.app-container\s*\{[^}]*height:\s*100%;[^}]*\}', '', content)
                content = re.sub(r'\.app-container\s*\{[^}]*min-height:\s*calc\([^)]+\);[^}]*\}', '', content)
                
                # Fix flex inside app-container to make inner scroll work
                # If a page has <el-row> or <el-col> inside, they might not scroll if their flex properties are wrong.
                # The user said "里面的内容flex动态布局"
                
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                    
print("Applied wide-panel classes and cleaned up overriding CSS")
