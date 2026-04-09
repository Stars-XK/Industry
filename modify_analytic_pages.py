import os

def update_predict():
    path = '/workspace/frontend/src/views/analytics/predict.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # fix color for text-white
    content = content.replace('.text-white { color: var(--el-text-color-primary); }', '.text-white { color: var(--el-text-color-regular); }')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_hydraulic():
    path = '/workspace/frontend/src/views/analytics/hydraulic.vue'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # .map-placeholder background
    content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-bg-color);')
    content = content.replace('background: var(--el-color-primary-light-9);', 'background: var(--el-border-color-extra-light);')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_predict()
update_hydraulic()
print("Updated analytics pages")
