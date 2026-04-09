import os

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the missing width: 100% in app-container
    content = content.replace('min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  }', 'min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;\n}')

    # Make specific container colors match light mode better
    content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
    content = content.replace('background: var(--el-fill-color-dark);', 'background: var(--el-fill-color-lighter);')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('/workspace/frontend/src/views/workflow/sop.vue')
update_file('/workspace/frontend/src/views/workflow/duty.vue')
update_file('/workspace/frontend/src/views/workflow/aigc.vue')
print("Updated remaining workflow pages")
