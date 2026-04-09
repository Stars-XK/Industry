import os

def fix_hmi(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # .tank .label text-shadow
    new_content = new_content.replace("text-shadow: 0 0 10px rgba(0, 216, 255, 0.5);", "text-shadow: 0 0 10px var(--el-color-primary-light-5);")
    
    # .pipe-horizontal border
    new_content = new_content.replace("rgba(0, 216, 255, 0.2)", "var(--el-color-primary-light-8)")
    
    # .flow-animation background
    new_content = new_content.replace("rgba(0, 216, 255, 0.3)", "var(--el-color-primary-light-7)")
    
    # .pump-station
    new_content = new_content.replace("background: rgba(0, 0, 0, 0.4);", "background: var(--el-bg-color-overlay);")
    new_content = new_content.replace("border: 1px solid rgba(0, 216, 255, 0.1);", "border: 1px solid var(--el-border-color-light);")
    new_content = new_content.replace("box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);", "box-shadow: inset 0 0 20px var(--el-bg-color-page);")
    
    # .pump.running
    new_content = new_content.replace("color: #00ffaa;", "color: var(--el-color-success);")
    new_content = new_content.replace("text-shadow: 0 0 15px rgba(0, 255, 170, 0.5);", "text-shadow: 0 0 15px var(--el-color-success-light-5);")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed hmi.vue")

fix_hmi('/workspace/frontend/src/views/scada/hmi.vue')
