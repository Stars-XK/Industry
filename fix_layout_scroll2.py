import os

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('overflow-x: hidden;', 'overflow-x: auto;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated layout.vue overflow-x")
