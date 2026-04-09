import os

path = '/workspace/frontend/src/views/scada/overview.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix KPI layout to be row instead of column
content = content.replace('''        <div class="box-card">
          <div class="metric-icon-wrap"''', '''        <div class="box-card kpi-card">
          <div class="metric-icon-wrap"''')

css_append = '''
.kpi-card {
  flex-direction: row;
  align-items: center;
  height: 120px;
  padding: 0 24px;
}
.kpi-card .metric-icon-wrap {
  margin-bottom: 0;
  margin-right: 20px;
  width: 56px;
  height: 56px;
  font-size: 28px;
  flex-shrink: 0;
}
.kpi-card .metric-info {
  justify-content: center;
}
'''

content = content.replace('</style>', css_append + '\n</style>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed overview.vue KPI layout")
