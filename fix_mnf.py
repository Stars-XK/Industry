import os

path = '/workspace/frontend/src/views/analytics/mnf.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a dropdown in the header actions
content = content.replace('''      <div class="header-actions">
        <el-button >生成听漏工单</el-button>
      </div>''', '''      <div class="header-actions" style="display: flex; gap: 16px; align-items: center;">
        <el-select v-model="selectedZone" placeholder="选择分区" style="width: 160px;" @change="loadData">
          <el-option label="东海园区" value="zone_1" />
          <el-option label="丰泽二期" value="zone_2" />
          <el-option label="新港高新区" value="zone_3" />
        </el-select>
        <el-button type="primary">生成听漏工单</el-button>
      </div>''')

# Update script to use selectedZone
script_add = "const selectedZone = ref('zone_1')\n"
content = content.replace("const loading = ref(false)", script_add + "const loading = ref(false)")

content = content.replace('''    hasAnomaly.value = true
    anomalyZone.value = '东海园区'
    nextTick(() => {
      initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [12, 11, 13, 25, 28, 26, 29], [10, 10, 10, 10, 10, 10, 10])
    })''', '''    
    // Simulate data based on zone
    if (selectedZone.value === 'zone_1') {
      hasAnomaly.value = true
      anomalyZone.value = '东海园区'
      nextTick(() => {
        initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [12, 11, 13, 25, 28, 26, 29], [10, 10, 10, 10, 10, 10, 10])
      })
    } else if (selectedZone.value === 'zone_2') {
      hasAnomaly.value = false
      anomalyZone.value = '丰泽二期'
      nextTick(() => {
        initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [8, 9, 8.5, 9, 8, 9.2, 8.8], [10, 10, 10, 10, 10, 10, 10])
      })
    } else {
      hasAnomaly.value = false
      anomalyZone.value = '新港高新区'
      nextTick(() => {
        initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [15, 14.5, 16, 15, 14, 15.5, 15], [18, 18, 18, 18, 18, 18, 18])
      })
    }''')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated mnf.vue")
