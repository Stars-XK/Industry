<template>
  <div class="asset-ledger fade-in-up">
    <div class="ledger-container">
      <!-- Premium Header -->
      <header class="ledger-header">
        <div class="header-main">
          <h1 class="headline">全域物理资产与设备台账</h1>
          <p class="sub-headline">支持树级挂载与点位属性的结构层级管理 (Asset Ledger)</p>
        </div>
        <div class="header-actions">
          <el-button class="action-btn primary" icon="Plus">注册资产</el-button>
          <el-button class="action-btn" icon="Upload">批量导入</el-button>
        </div>
      </header>

      <div class="ledger-workspace">
      <!-- Left Sidebar: Structural Hierarchy -->
      <aside class="hierarchy-sidebar">
        <div class="sidebar-header">
          <h2>组织与站点架构</h2>
          <el-input 
            v-model="filterText" 
            placeholder="搜索站点或分区..." 
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
                  <el-icon v-if="data.level === 'zone'" :size="14"><MapLocation /></el-icon>
                  <el-icon v-else-if="data.level === 'site'" :size="14"><HomeFilled /></el-icon>
                </div>
                <span class="node-label">{{ node.label }}</span>
                <span v-if="data.level === 'zone'" class="node-type-badge">{{ data.zoneType || 'DMA分区' }}</span>
                <span v-if="data.level === 'site'" class="node-type-badge site-badge">{{ data.type || '物理站点' }}</span>
                <span v-if="data.level === 'site'" class="node-badge">{{ data.deviceCount || 0 }}</span>
                <el-dropdown trigger="click" @command="handleCommand($event, data)" placement="bottom-end">
                  <span class="node-actions" @click.stop>
                    <el-icon><More /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="data.level === 'zone'" command="addZone">添加子分区</el-dropdown-item>
                      <el-dropdown-item v-if="data.level === 'zone'" command="addSite">添加物理站点</el-dropdown-item>
                      <el-dropdown-item command="edit">编辑节点信息</el-dropdown-item>
                      <el-dropdown-item command="delete" divided class="text-danger">删除该节点</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
              <p class="content-meta">挂载到该物理站点的设备及测点台账列表</p>
            </div>
            <div class="content-filters">
              <el-input placeholder="过滤设备..." class="sleek-input small" prefix-icon="Filter" />
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
                  <span class="install-date">安装日期: {{ device.installDate }}</span>
                  <el-button link class="text-action">编辑信息</el-button>
                  <el-button link class="text-action">换表接续</el-button>
                  <el-button link class="text-action danger">删除设备</el-button>
                </div>
              </div>
              
              <!-- Measuring Points -->
              <div class="points-grid" v-if="device.points && device.points.length > 0">
                <div class="points-header">
                  <h4>输出测点 (Measuring Points)</h4>
                  <el-button link class="text-action small" icon="Plus">添加测点</el-button>
                </div>
                <div class="points-table-wrapper">
                  <table class="sleek-table">
                    <thead>
                      <tr>
                        <th>测点编码</th>
                        <th>测点名称</th>
                        <th>数据类型</th>
                        <th>单位</th>
                        <th>更新时间</th>
                        <th class="align-right">操作</th>
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
                          <el-button link class="text-action small">配置映射</el-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="empty-points">
                <p>该设备暂未配置任何物理输出测点。</p>
                <el-button link class="text-action small" icon="Plus">添加测点</el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon"><el-icon><DataBoard /></el-icon></div>
          <h3>未选择分区</h3>
          <p>请在左侧的架构树中选择一个具体的 DMA 分区，以查看并管理其挂载的设备与测点台账。</p>
        </div>
      </main>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { MapLocation, HomeFilled, Search, Plus, Filter, DataBoard, More } from '@element-plus/icons-vue'
import request from '@/utils/request'

const filterText = ref('')
const treeRef = ref<any>(null)
const currentSiteName = ref('')
const siteTree = ref<any[]>([])
const deviceList = ref<any[]>([])
const currentSiteId = ref<number | null>(null)

const defaultProps = {
  children: 'children',
  label: 'label',
}

const fetchTreeData = async () => {
  try {
    // 调用后端刚刚写好的 tree 接口
    const res = await request.get('/api/v1/system/zone/tree')
    siteTree.value = res || []
  } catch (error) {
    console.error('Failed to fetch asset tree:', error)
  }
}

const fetchDevices = async (id: number) => {
  try {
    const res = await request.get(`/api/v1/system/asset/devices`, {
      params: { zoneId: id, page: 1, size: 50 }
    })
    // 映射后端字段到前端需要展示的结构
    deviceList.value = (res?.list || []).map((d: any) => ({
      id: d.id,
      deviceCode: d.device_code,
      deviceName: d.device_name,
      deviceType: getDeviceTypeName(d.device_type),
      installDate: d.install_date,
      status: d.status === 1 ? '在线' : '离线',
      points: (d.points || []).map((p: any) => ({
        pointCode: p.point_code,
        pointName: p.point_name,
        pointType: getPointCategoryName(p.point_category),
        unit: p.unit,
        updateTime: '-'
      }))
    }))
  } catch (error) {
    console.error('Failed to fetch devices:', error)
  }
}

const getDeviceTypeName = (type: number) => {
  const map: Record<number, string> = { 1: '智能水表', 2: '压力计', 3: '水泵', 4: '水质仪' }
  return map[type] || '未知设备'
}

const getPointCategoryName = (category: number) => {
  const map: Record<number, string> = { 1: '瞬时流量', 2: '压力', 3: '水质', 4: '状态值', 5: '累计流量' }
  return map[category] || '其他'
}

onMounted(() => {
  fetchTreeData()
})

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

const handleNodeClick = (data: any) => {
  currentSiteName.value = data.label
  currentSiteId.value = data.realId
  fetchDevices(data.realId)
}

const handleCommand = (command: string, data: any) => {
  console.log(`Command: ${command}, Node:`, data)
  // TODO: implement modals for creation and editing
}
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
  height: calc(100vh - 50px);
  padding: 2%;
  color: #11181c;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 内部容器，添加边框和圆角使高级感更强 */
.ledger-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

/* Header */
.ledger-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #eaeaea;
}

.headline {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 4px 0;
  color: #11181c;
}
.sub-headline {
  font-size: 13px;
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
  background: var(--el-color-primary);
  color: #fff;
  border: none;
}
.action-btn.primary:hover {
  background: var(--el-color-primary-light-3);
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
  padding: 16px;
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
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
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
.sleek-tree :deep(.el-tree-node__content:hover) {
  background-color: transparent;
}
.sleek-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
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
.node-icon svg {
  opacity: 0.85;
}
.node-icon.org { color: var(--el-color-primary); }
.node-icon.zone { color: var(--el-color-success); }
.node-icon.site { color: var(--el-color-warning); }

.node-icon .el-icon {
  font-size: 14px !important;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}
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

.node-type-badge {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 500;
  border: 1px solid var(--el-color-primary-light-5);
}

.site-badge {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  border-color: var(--el-color-warning-light-5);
}

.node-actions {
  display: none;
  cursor: pointer;
  color: #889096;
  padding: 2px 4px;
  border-radius: 4px;
}
.node-actions:hover {
  background: #eaeaea;
  color: #11181c;
}
.sleek-tree :deep(.el-tree-node__content:hover) .node-actions {
  display: flex;
  align-items: center;
}

/* Right Main Content */
.ledger-content {
  flex: 1;
  background: #ffffff;
  overflow-y: auto;
  padding: 24px;
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
  font-size: 32px;
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
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 6px 0;
}

.content-meta {
  font-size: 13px;
  color: #687076;
  margin: 0;
}

/* Device List (Cardless approach) */
.device-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  padding: 16px 20px;
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
.status-indicator.online { background-color: var(--el-color-success); box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2); }
.status-indicator.offline { background-color: var(--el-color-danger); box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2); }

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
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
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
.text-action:hover { color: var(--el-color-primary); }
.text-action.danger { color: var(--el-color-danger); }

/* Measuring Points Table */
.points-grid {
  padding: 16px 20px;
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
.type-dot.blue { background-color: var(--el-color-primary); }
.type-dot.green { background-color: var(--el-color-success); }
.type-dot.orange { background-color: var(--el-color-warning); }
.type-dot.gray { background-color: #889096; }

.empty-points {
  padding: 24px;
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
