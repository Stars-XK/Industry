import os

path = '/workspace/frontend/src/views/scada/overview.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix grid for KPIs
content = content.replace('<el-col :span="6" v-for="(item, index) in metrics" :key="index">', '<el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in metrics" :key="index" style="margin-bottom: 24px;">')

# Fix other grids to use responsive props instead of hardcoded 12 and 16/8
content = content.replace('<el-col :span="12">', '<el-col :xs="24" :lg="12" style="margin-bottom: 24px;">')
content = content.replace('<el-col :span="16">', '<el-col :xs="24" :lg="16" style="margin-bottom: 24px;">')
content = content.replace('<el-col :span="8">', '<el-col :xs="24" :lg="8" style="margin-bottom: 24px;">')

# Remove the broken media query
content = content.replace('''@media (max-width: 1400px) {
  .el-col {
    width: 100% ;
    flex: 0 0 100% ;
    max-width: 100% ;
    margin-bottom: 24px;
  }
}''', '')

# Ensure row margin doesn't mess up layout
content = content.replace('<el-row :gutter="24" style="margin-top: 24px;">', '<el-row :gutter="24">')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed overview.vue grid")
