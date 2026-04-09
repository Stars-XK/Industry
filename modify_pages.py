import os
import re

def update_visual_studio():
    path = '/workspace/frontend/src/views/system/visual-studio.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update `.designer-container` background
    content = content.replace('background: var(--el-box-shadow-light);', 'background: var(--el-bg-color);')
    # 2. Update `.panel-subtitle` background
    content = content.replace('background-color: var(--el-box-shadow);', 'background-color: var(--el-fill-color-blank);')
    # 3. Update `.components-panel` and `.props-panel` background
    content = content.replace('background-color: var(--el-fill-color-light);', 'background-color: var(--el-fill-color-blank);')
    # 4. Update `.empty-text`
    content = content.replace('color: var(--el-border-color);', 'color: var(--el-text-color-secondary);')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def update_topology():
    path = '/workspace/frontend/src/views/scada/topology.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Make .canvas-container look better in light mode
    content = content.replace('background: var(--el-fill-color-light);', 'background: var(--el-bg-color);')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_hmi():
    path = '/workspace/frontend/src/views/scada/hmi.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # .hmi-canvas
    content = content.replace('background: var(--el-fill-color-light);', 'background: var(--el-bg-color);')
    # .tank-container
    content = content.replace('background: var(--el-fill-color-dark);', 'background: var(--el-fill-color-lighter);')
    content = content.replace('box-shadow: inset 0 -10px 30px var(--el-color-primary-light-8);', 'box-shadow: inset 0 -10px 20px var(--el-color-primary-light-9);')
    # .data-panel
    content = content.replace('background: var(--el-fill-color-dark);', 'background: var(--el-fill-color-lighter);')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_visual_studio()
update_topology()
update_hmi()
print("Specific pages updated.")
