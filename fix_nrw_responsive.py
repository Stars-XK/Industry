import os

path = '/workspace/frontend/src/views/analytics/nrw.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add responsive spans
content = content.replace('<el-col :span="10">', '<el-col :xs="24" :lg="8" :xl="7">')
content = content.replace('<el-col :span="14">', '<el-col :xs="24" :lg="16" :xl="17">')

# Make sure row margin bottom wraps nicely
content = content.replace('<el-row :gutter="24" style="margin-bottom: 24px;">', '<el-row :gutter="24" style="margin-bottom: 24px; flex-wrap: wrap;">')

# Ensure the cards have minimum heights to look good when stacked
content = content.replace('class="box-card" v-loading="loading"', 'class="box-card" v-loading="loading" style="min-height: 500px; margin-bottom: 24px;"')
content = content.replace('class="box-card" v-loading="sankeyLoading"', 'class="box-card" v-loading="sankeyLoading" style="min-height: 500px; margin-bottom: 24px;"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated nrw.vue responsive grid")
