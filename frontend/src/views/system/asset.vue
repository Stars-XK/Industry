<template>
  <div class="asset-ledger fade-in-up">
    <!-- Premium Header -->
    <header class="ledger-header">
      <div class="header-main">
        <h1 class="headline">Asset Ledger</h1>
        <p class="sub-headline">Global Physical Assets & Structural Hierarchy</p>
      </div>
      <div class="header-actions">
        <el-button class="action-btn primary" icon="Plus">Register Asset</el-button>
        <el-button class="action-btn" icon="Upload">Batch Import</el-button>
      </div>
    </header>

    <div class="ledger-workspace">
      <!-- Left Sidebar: Structural Hierarchy -->
      <aside class="hierarchy-sidebar">
        <div class="sidebar-header">
          <h2>Structural Hierarchy</h2>
          <el-input 
            v-model="filterText" 
            placeholder="Search sites or zones..." 
            clearable 
            class="sleek-input"
            prefix-icon="Search"
          />
        </div>
        <div class="tree-container custom-scrollbar">
          <el-tree
            ref="treeRef"
            :data="siteTree"
            :props="defaultProps"
            :filter-node-method="filterNode"
            node-key="id"
            default-expand-all
            highlight-current
            class="sleek-tree"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <div class="node-icon" :class="data.level">
                  <el-icon v-if="data.level === 'org'"><OfficeBuilding /></el-icon>
                  <el-icon v-else-if="data.level === 'zone'"><MapLocation /></el-icon>
                  <el-icon v-else-if="data.level === 'site'"><HomeFilled /></el-icon>
                </div>
                <span class="node-label">{{ node.label }}</span>
                <span v-if="data.level === 'site'" class="node-badge">{{ data.deviceCount || 0 }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </aside>

      <!-- Right Main Content: Device & Measuring Points -->
      <main class="ledger-content">
        <div v-if="currentSiteName" class="content-wrapper fade-in">
          <div class="content-header">
            <div>
              <h2 class="content-title">{{ currentSiteName }}</h2>
              <p class="content-meta">Devices and measuring points mapped to this physical site.</p>
            </div>
            <div class="content-filters">
              <el-input placeholder="Filter devices..." class="sleek-input small" prefix-icon="Filter" />
            </div>
          </div>

          <div class="device-list">
            <div v-for="device in deviceList" :key="device.id" class="device-item">
              <div class="device-header">
                <div class="device-info">
                  <div class="status-indicator" :class="device.status === '在线' ? 'online' : 'offline'"></div>
                  <h3 class="device-name">{{ device.deviceName }}</h3>
                  <span class="device-code">{{ device.deviceCode }}</span>
                  <span class="device-type-badge">{{ device.deviceType }}</span>
                </div>
                <div class="device-actions">
                  <span class="install-date">Installed: {{ device.installDate }}</span>
                  <el-button link class="text-action">Edit</el-button>
                  <el-button link class="text-action danger">Replace</el-button>
                </div>
              </div>
              
              <!-- Measuring Points -->
              <div class="points-grid" v-if="device.points && device.points.length > 0">
                <div class="points-header">
                  <h4>Measuring Points</h4>
                  <el-button link class="text-action small" icon="Plus">Add Point</el-button>
                </div>
                <div class="points-table-wrapper">
                  <table class="sleek-table">
                    <thead>
                      <tr>
                        <th>Point Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Unit</th>
                        <th>Last Updated</th>
                        <th class="align-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="point in device.points" :key="point.pointCode">
                        <td class="mono">{{ point.pointCode }}</td>
                        <td>{{ point.pointName }}</td>
                        <td><span class="type-dot" :class="getPointColorClass(point.pointType)"></span>{{ point.pointType }}</td>
                        <td class="subtle">{{ point.unit || '-' }}</td>
                        <td class="subtle">{{ point.updateTime }}</td>
                        <td class="align-right">
                          <el-button link class="text-action small">Map Tag</el-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="empty-points">
                <p>No measuring points configured for this device.</p>
                <el-button link class="text-action small" icon="Plus">Add Point</el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon"><el-icon><DataBoard /></el-icon></div>
          <h3>Select a Site</h3>
          <p>Choose a physical site from the structural hierarchy on the left to view and manage its devices.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { OfficeBuilding, MapLocation, HomeFilled, Search, Plus, Filter, DataBoard } from '@element-plus/icons-vue'

const filterText = ref('')
const treeRef = ref<any>(null)
const currentSiteName = ref('')

const defaultProps = {
  children: 'children',
  label: 'label',
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

const handleNodeClick = (data: any) => {
  if (data.level === 'site') {
    currentSiteName.value = data.label
  } else {
    currentSiteName.value = ''
  }
}

// 模拟数据：部门 -> 分区 -> 站点 (与 mysql_seed.sql 保持完全一致)
const siteTree = ref([
  {
    id: 1,
    label: '泉州水务集团',
    level: 'org',
    children: [
      {
        id: 2,
        label: '丰泽区供水分公司',
        level: 'org',
        children: [
          {
            id: 102,
            label: '丰泽区 (DMA分区)',
            level: 'zone',
            children: [
              {
                id: 201,
                label: '东海科技园区DMA',
                level: 'zone',
                children: [
                  { id: 1, label: '东海园区进水泵站', level: 'site', deviceCount: 2 }
                ]
              },
              {
                id: 202,
                label: '泉港新片区DMA',
                level: 'zone',
                children: [
                  { id: 3, label: '西湖水质监测点', level: 'site', deviceCount: 1 }
                ]
              },
              { id: 2, label: '丰泽2号加压泵站', level: 'site', deviceCount: 1 }
            ]
          }
        ]
      },
      {
        id: 4,
        label: '鲤城区供水分公司',
        level: 'org',
        children: [
          {
            id: 104,
            label: '鲤城区 (DMA分区)',
            level: 'zone',
            children: [
              {
                id: 204,
                label: '洛江开发区DMA',
                level: 'zone',
                children: [
                  { id: 4, label: '鲤城地下泵房', level: 'site', deviceCount: 3 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
])

// 模拟数据：设备与测点列表 (匹配 mysql_seed.sql 真实数据)
const deviceList = ref([
  {
    id: '1',
    deviceCode: 'METER_IN_01',
    deviceName: '东海园区总进水管表',
    deviceType: '智能水表',
    installDate: '2023-01-15',
    status: '在线',
    points: [
      { pointCode: 'METER_IN_01_TEMP', pointName: '温度', pointType: '状态值', unit: '°C', updateTime: '2026-04-09 10:00:00' },
      { pointCode: 'METER_IN_01_PRESS', pointName: '水压', pointType: '压力', unit: 'MPa', updateTime: '2026-04-09 10:00:00' },
      { pointCode: 'METER_IN_01_FLOW', pointName: '瞬时流量', pointType: '瞬时流量', unit: 'm³/h', updateTime: '2026-04-09 10:00:00' },
      { pointCode: 'METER_IN_01_TOTAL', pointName: '累计流量', pointType: '累计流量', unit: 'm³', updateTime: '2026-04-09 10:00:00' }
    ]
  },
  {
    id: '203',
    deviceCode: 'PRESS_01',
    deviceName: '东海末端管网压力计',
    deviceType: '压力计',
    installDate: '2022-05-20',
    status: '在线',
    points: []
  }
])

const getPointColorClass = (type: string) => {
  switch (type) {
    case '瞬时流量': return 'blue'
    case '累计流量': return 'green'
    case '压力': return 'orange'
    default: return 'gray'
  }
}
</script>

<style scoped>
/* Premium Linear-style Reset & Typography */
.asset-ledger {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fcfcfc;
  color: #11181c;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.ledger-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 32px 40px;
  background: #ffffff;
  border-bottom: 1px solid #eaeaea;
}

.headline {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 4px 0;
  color: #11181c;
}

.sub-headline {
  font-size: 14px;
  color: #687076;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}
.action-btn.primary {
  background: #11181c;
  color: #fff;
  border: none;
}
.action-btn.primary:hover {
  background: #2b3236;
}

/* Workspace Layout */
.ledger-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Left Sidebar */
.hierarchy-sidebar {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px;
}

.sidebar-header h2 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #687076;
  margin: 0 0 16px 0;
}

.sleek-input :deep(.el-input__wrapper) {
  background-color: #f1f3f5;
  box-shadow: none;
  border-radius: 6px;
}
.sleek-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #11181c inset;
  background-color: #fff;
}
.sleek-input.small :deep(.el-input__wrapper) {
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #eaeaea inset;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
}

.sleek-tree {
  background: transparent;
}
.sleek-tree :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 6px;
  margin-bottom: 2px;
}
.sleek-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #f1f3f5;
  color: #11181c;
  font-weight: 500;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #889096;
}
.node-icon.org { color: #3e63dd; }
.node-icon.zone { color: #29a366; }
.node-icon.site { color: #e54d2e; }

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-badge {
  background: #eaeaea;
  color: #687076;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 12px;
  margin-right: 8px;
  font-weight: 600;
}

/* Right Main Content */
.ledger-content {
  flex: 1;
  background: #fcfcfc;
  overflow-y: auto;
  padding: 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #889096;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #11181c;
}
.empty-state p {
  font-size: 14px;
  max-width: 400px;
  text-align: center;
  line-height: 1.5;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.content-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 6px 0;
}

.content-meta {
  font-size: 14px;
  color: #687076;
  margin: 0;
}

/* Device List (Cardless approach) */
.device-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.device-item {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
  background: #fafafa;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-indicator.online { background-color: #29a366; box-shadow: 0 0 0 2px rgba(41,163,102,0.2); }
.status-indicator.offline { background-color: #e54d2e; box-shadow: 0 0 0 2px rgba(229,77,46,0.2); }

.device-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.device-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #687076;
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.device-type-badge {
  font-size: 12px;
  color: #3e63dd;
  background: #e6edfe;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.device-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.install-date {
  font-size: 13px;
  color: #889096;
}

.text-action {
  font-size: 13px;
  font-weight: 500;
  color: #11181c;
  padding: 0;
}
.text-action:hover { color: #3e63dd; }
.text-action.danger { color: #e54d2e; }

/* Measuring Points Table */
.points-grid {
  padding: 24px;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.points-header h4 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #687076;
  margin: 0;
}

.sleek-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.sleek-table th {
  padding: 8px 12px;
  color: #889096;
  font-weight: 500;
  border-bottom: 1px solid #eaeaea;
}

.sleek-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f5;
  color: #11181c;
}

.sleek-table tr:last-child td {
  border-bottom: none;
}

.sleek-table .mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #687076;
}

.sleek-table .subtle {
  color: #687076;
}

.align-right {
  text-align: right;
}

.type-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}
.type-dot.blue { background-color: #3e63dd; }
.type-dot.green { background-color: #29a366; }
.type-dot.orange { background-color: #f76b15; }
.type-dot.gray { background-color: #889096; }

.empty-points {
  padding: 32px;
  text-align: center;
  color: #889096;
  font-size: 13px;
}

.empty-points p {
  margin: 0 0 12px 0;
}

/* Animations */
.fade-in-up {
  animation: fadeInUp 0.4s ease forwards;
}
.fade-in {
  animation: fadeIn 0.3s ease forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
