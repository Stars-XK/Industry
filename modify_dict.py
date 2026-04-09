import os

path = '/workspace/frontend/src/views/system/dict.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix layout issues for sys-dict-container
content = content.replace('.sys-dict-container {\n  display: flex;\n  gap: 20px;\n}', '.sys-dict-container {\n  display: flex;\n  flex-direction: row;\n  gap: 20px;\n  align-items: flex-start;\n}')

# Make left/right panel size correct since they are now .box-card instead of custom panels
content = content.replace('<!-- 左侧：字典类型列表 -->\n    <div class="box-card">', '<!-- 左侧：字典类型列表 -->\n    <div class="box-card" style="width: 300px; padding: 0; overflow: hidden; flex: none;">')
content = content.replace('<!-- 右侧：字典数据列表 -->\n    <div class="box-card">', '<!-- 右侧：字典数据列表 -->\n    <div class="box-card" style="flex: 1; padding: 0; overflow: hidden;">')

# Fix background colors for light mode
content = content.replace('background: var(--el-box-shadow-light);', 'background: var(--el-fill-color-light);')
content = content.replace('background: var(--el-fill-color-light);', 'background: var(--el-fill-color-lighter);')
content = content.replace('background: var(--el-color-primary-light-9);', 'background: var(--el-color-primary-light-9);')


with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated dict.vue")
