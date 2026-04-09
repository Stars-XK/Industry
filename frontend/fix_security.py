import os

def fix_security(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # Pulse tag
    new_content = new_content.replace("background-color: rgba(16, 185, 129, 0.2);", "background-color: var(--el-color-success-light-8);")
    new_content = new_content.replace("border-color: rgba(16, 185, 129, 0.5);", "border-color: var(--el-color-success-light-5);")
    new_content = new_content.replace("color: #34d399;", "color: var(--el-color-success);")
    new_content = new_content.replace("0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }", "0% { box-shadow: 0 0 0 0 var(--el-color-success-light-5); }")
    new_content = new_content.replace("70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }", "70% { box-shadow: 0 0 0 6px transparent; }")
    new_content = new_content.replace("100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }", "100% { box-shadow: 0 0 0 0 transparent; }")
    
    # Video matrix
    new_content = new_content.replace("border: 1px solid rgba(0, 216, 255, 0.2);", "border: 1px solid var(--el-border-color-darker);")
    new_content = new_content.replace("background: rgba(0, 0, 0, 0.6);", "background: var(--el-fill-color-dark);")
    new_content = new_content.replace("box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8);", "box-shadow: inset 0 0 30px var(--el-color-black);")
    new_content = new_content.replace("background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);", "background: linear-gradient(180deg, var(--el-color-black) 0%, transparent 100%);")
    new_content = new_content.replace("box-shadow: 0 0 8px #10b981;", "box-shadow: 0 0 8px var(--el-color-success);")

    # Other text colors
    new_content = new_content.replace("color: #475569;", "color: var(--el-text-color-regular);")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed security.vue")

fix_security('/workspace/frontend/src/views/scada/security.vue')
