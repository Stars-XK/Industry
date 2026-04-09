import os

path = '/workspace/frontend/src/views/analytics/nrw.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix app-container width setting
content = content.replace('flex: 1;\n  }', 'flex: 1;\n  width: 100%;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated nrw.vue")
