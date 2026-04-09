import os

path = '/workspace/frontend/src/views/governance/edge-tag.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make industrial card look nice in light mode
content = content.replace('background: var(--el-bg-color-overlay);', 'background: var(--el-fill-color-blank);')
# High latency
content = content.replace('text-shadow: 0 0 10px var(--el-color-danger-light-5);', 'text-shadow: none;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated edge-tag.vue")
