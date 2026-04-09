import os
import re

path = '/workspace/frontend/src/views/analytics/nrw.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# fix the build error about exportReport and ElMessage correctly if needed
if "import { ElMessage } from 'element-plus'" not in content:
    content = content.replace("import { ref, onMounted, onBeforeUnmount } from 'vue'", "import { ref, onMounted, onBeforeUnmount } from 'vue'\nimport { ElMessage } from 'element-plus'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated nrw.vue again")
