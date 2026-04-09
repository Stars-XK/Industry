import os

path = '/workspace/frontend/src/views/scada/hmi.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <div class="hmi-content"> with a layout containing a sidebar
new_hmi_content = """
    <div class="hmi-content" style="display: flex; gap: 24px; flex: 1; min-height: 0;">
      <!-- 左侧：站点列表 -->
      <div class="box-card" style="width: 280px; flex: none; overflow-y: auto;">
        <div class="panel-header">
          <div class="header-title">工艺站点导航</div>
        </div>
        <el-menu :default-active="activeStation" class="station-menu" @select="handleStationSelect">
          <el-menu-item index="1">
            <el-icon><DataBoard /></el-icon>
            <span>1# 进水泵房</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><Operation /></el-icon>
            <span>2# 变频主泵组</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Filter /></el-icon>
            <span>3# 污泥脱水机房</span>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><Setting /></el-icon>
            <span>4# 加药车间</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧：组态画面 -->
      <div class="box-card" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
        <div class="panel-header">
          <div>
            <div class="header-title">{{ stationName }} 工艺流程监控</div>
            <div class="header-subtitle">Process Flow Monitoring</div>
          </div>
        </div>
        <div class="hmi-canvas" v-loading="loadingStation">
"""

content = content.replace('''    <div class="hmi-content">
      <div class="box-card">
        <div class="panel-header">
          <div>
            <div class="header-title">工艺流程监控</div>
            <div class="header-subtitle">Process Flow Monitoring</div>
          </div>
        </div>
        <div class="hmi-canvas">''', new_hmi_content)

# We also need to add DataBoard icon and activeStation state
content = content.replace("import { Setting, SwitchButton, Operation, Loading, Filter, CircleClose }", "import { Setting, SwitchButton, Operation, Loading, Filter, CircleClose, DataBoard }")
content = content.replace("const tankLevel = ref(65.5)", "const activeStation = ref('2')\nconst stationName = ref('2# 变频主泵组')\nconst loadingStation = ref(false)\nconst tankLevel = ref(65.5)")

script_add = """
const handleStationSelect = (index: string) => {
  activeStation.value = index
  loadingStation.value = true
  const names: Record<string, string> = {
    '1': '1# 进水泵房',
    '2': '2# 变频主泵组',
    '3': '3# 污泥脱水机房',
    '4': '4# 加药车间'
  }
  stationName.value = names[index] || ''
  
  // Simulate fetching new station data and changing graphics
  setTimeout(() => {
    tankLevel.value = Math.random() * 50 + 30
    pumpStatus.value = Math.random() > 0.5 ? 1 : 0
    pumpFreq.value = pumpStatus.value === 1 ? (Math.random() * 20 + 30).toFixed(1) as any : 0.0
    pumpPower.value = pumpStatus.value === 1 ? (Math.random() * 10 + 15).toFixed(1) as any : 0.0
    loadingStation.value = false
  }, 600)
}
"""
content = content.replace("const handleControl = (targetStatus: number) => {", script_add + "\nconst handleControl = (targetStatus: number) => {")

# Add some css for station-menu
css_add = """
.station-menu {
  border-right: none;
  background: transparent;
}
.station-menu .el-menu-item {
  border-radius: 8px;
  margin-bottom: 8px;
  height: 48px;
  line-height: 48px;
}
.station-menu .el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}
"""
content = content.replace("</style>", css_add + "</style>")

# Close the extra div for the left/right layout
content = content.replace('''          <div class="valve">
            <el-icon :size="30" color="var(--el-color-warning)"><Filter /></el-icon>
            <div class="valve-label">出水总阀</div>
          </div>
        </div>
      </div>
    </div>''', '''          <div class="valve">
            <el-icon :size="30" color="var(--el-color-warning)"><Filter /></el-icon>
            <div class="valve-label">出水总阀</div>
          </div>
        </div>
      </div>
    </div>''')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated hmi.vue with linkage")
