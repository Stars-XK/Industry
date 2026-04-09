import os

path = '/workspace/frontend/src/views/analytics/nrw.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix chart rendering code that might cause build errors (month is not defined)
content = content.replace("params: { month: month.value }", "params: { month: dateRange.value[0].getMonth() + 1 }")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated nrw.vue")
