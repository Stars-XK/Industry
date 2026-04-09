import os

def fix_security_2(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    new_content = new_content.replace("color: #ef4444;", "color: var(--el-color-danger);")
    new_content = new_content.replace("background-color: #ef4444;", "background-color: var(--el-color-danger);")
    new_content = new_content.replace("box-shadow: 0 0 8px #10b981;", "box-shadow: 0 0 8px var(--el-color-success);")
    new_content = new_content.replace("border: 1px solid #f43f5e;", "border: 1px solid var(--el-color-danger-light-5);")
    new_content = new_content.replace("background: rgba(244, 63, 94, 0.1);", "background: var(--el-color-danger-light-9);")
    new_content = new_content.replace("box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);", "box-shadow: 0 0 15px var(--el-color-danger-light-5);")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed security.vue part 2")

fix_security_2('/workspace/frontend/src/views/scada/security.vue')
