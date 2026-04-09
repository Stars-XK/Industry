import os

def fix_nrw(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # Echarts colors
    new_content = new_content.replace("'rgba(15, 23, 42, 0.9)'", "'var(--el-bg-color-overlay)'")
    new_content = new_content.replace("'rgba(255,255,255,0.1)'", "'var(--el-border-color-light)'")
    new_content = new_content.replace("'#e2e8f0'", "'var(--el-text-color-primary)'")
    new_content = new_content.replace("'#64748b'", "'var(--el-text-color-regular)'")
    new_content = new_content.replace("'#334155'", "'var(--el-border-color-darker)'")
    new_content = new_content.replace("'#1e293b'", "'var(--el-border-color-light)'")
    new_content = new_content.replace("'#f59e0b'", "'var(--el-color-warning)'")
    new_content = new_content.replace("'rgba(245,158,11,0.5)'", "'var(--el-color-warning-light-5)'")
    new_content = new_content.replace("'rgba(245,158,11,0.05)'", "'transparent'")
    new_content = new_content.replace("'rgba(255,255,255,0.2)'", "'var(--el-border-color-darker)'")
    
    # CSS
    new_content = new_content.replace("color: #f59e0b;", "color: var(--el-color-warning);")
    new_content = new_content.replace("color: #475569;", "color: var(--el-text-color-regular);")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed nrw.vue")

fix_nrw('/workspace/frontend/src/views/analytics/nrw.vue')
