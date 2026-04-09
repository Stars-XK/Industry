import os

path = '/workspace/frontend/src/views/analytics/mnf.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the messy setTimeouts
content = content.replace('setTimeout(() => {', 'nextTick(() => {\n        setTimeout(() => {')
content = content.replace('}, 100)', '  }, 100)\n      })')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed timeout logic")
