import os
import re

def update_integration():
    path = '/workspace/frontend/src/views/governance/integration.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # fix the flex layout issues
    content = content.replace('min-height: calc(100vh - 60px);', 'min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;')
    
    # replace standard el-card with .box-card div for consistency if possible, or just fix background
    content = content.replace('background-color: var(--el-fill-color-light);', 'background-color: var(--el-fill-color-blank);')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_interpolate():
    path = '/workspace/frontend/src/views/governance/interpolate.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_integration()
update_interpolate()
print("Updated gov pages")
