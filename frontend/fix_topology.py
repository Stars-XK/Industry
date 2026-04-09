import os
import re

def fix_topology(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # Tooltip background/border
    new_content = new_content.replace("'rgba(15, 23, 42, 0.9)'", "'var(--el-bg-color-overlay)'")
    new_content = new_content.replace("'rgba(0, 216, 255, 0.2)'", "'var(--el-color-primary-light-5)'")
    new_content = new_content.replace("'#e2e8f0'", "'var(--el-text-color-primary)'")
    
    # Echarts colors
    new_content = new_content.replace("color: '#00d8ff'", "color: 'var(--el-color-primary)'")
    new_content = new_content.replace("borderColor: '#020617'", "borderColor: 'var(--el-bg-color)'")
    new_content = new_content.replace("'rgba(148, 163, 184, 0.3)'", "'var(--el-border-color-darker)'")
    
    # Map tree data colors
    new_content = new_content.replace("color: '#F56C6C'", "color: 'var(--el-color-danger)'")
    new_content = new_content.replace("'rgba(245, 108, 108, 0.8)'", "'var(--el-color-danger-light-5)'")
    new_content = new_content.replace("'rgba(0, 216, 255, 0.5)'", "'var(--el-color-primary-light-5)'")
    
    # Template fixes
    new_content = new_content.replace('color: #64748b;', 'color: var(--el-text-color-regular);')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed topology.vue")

fix_topology('/workspace/frontend/src/views/scada/topology.vue')
