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
            placeholder="搜索分区..." 
            clearable 
            class="sleek-input"
            prefix-icon="Search"
          />
        </div>
        <div class="tree-container custom-scrollbar">
          <el-tree
            ref="treeRef"
            :data="zoneTree"
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
                <div class="node-icon zone">
                  <el-icon :size="14"><MapLocation /></el-icon>
                </div>
                <span class="node-label">{{ node.label }}</span>
                <span class="node-type-badge">{{ data.zoneType || 'DMA分区' }}</span>
                <el-dropdown trigger="click" @command="handleCommand($event, data)" placement="bottom-end">
                  <span class="node-actions" @click.stop>
                    <el-icon><More /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="addZone">添加子分区</el-dropdown-item>
                      <el-dropdown-item command="addSite">添加物理站点</el-dropdown-item>
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
        <div v-if="currentZoneName" class="content-wrapper fade-in">
          <div class="content-header">
            <div>
              <h2 class="content-title">{{ currentZoneName }}</h2>
              <p class="content-meta">挂载到该分区的物理站点及设备测点台账</p>
            </div>
            <div class="content-filters">
              <el-input placeholder="全局过滤..." class="sleek-input small" prefix-icon="Filter" />
            </div>
          </div>

          <el-tabs v-model="activeTab" class="ledger-tabs">
            <el-tab-pane label="2D架构拓扑" name="topology">
              <div class="topology-wrapper" ref="topologyRef"></div>
            </el-tab-pane>

            <el-tab-pane label="下辖物理站点" name="sites">
              <div class="site-list">
                <el-table :data="siteList" border stripe style="width: 100%; margin-top: 16px">
                  <el-table-column prop="site_code" label="站点编码" width="180" />
                  <el-table-column prop="site_name" label="站点名称" />
                  <el-table-column label="站点类型" width="180">
                    <template #default="{ row }">
                      <span class="node-type-badge site-badge">{{ getSiteTypeName(row.site_type) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                      <el-button link class="text-action" @click="viewSiteDevices(row)">查看设备台账</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="挂载设备台账" name="devices">
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
                            <td class="strong">{{ point.pointName }}</td>
                            <td>
                              <span class="data-type-dot" :class="getPointColorClass(point.pointType)"></span>
                              {{ point.pointType }}
                            </td>
                            <td class="mono">{{ point.unit || '-' }}</td>
                            <td class="mono text-muted">{{ point.updateTime }}</td>
                            <td class="align-right">
                              <el-button link class="text-action small">配置映射</el-button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="points-empty" v-else>
                    该设备暂未配置任何物理输出测点。
                    <el-button link type="primary" icon="Plus">添加测点</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
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
import { ref, watch, onMounted, nextTick, shallowRef } from 'vue'
import { MapLocation, HomeFilled, Search, Plus, Filter, DataBoard, More } from '@element-plus/icons-vue'
import request from '@/utils/request'
import * as echarts from 'echarts/core';
import { TreeChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TreeChart, TooltipComponent, CanvasRenderer]);

const filterText = ref('')
const treeRef = ref<any>(null)
const currentZoneName = ref('')
const zoneTree = ref<any[]>([])
const siteList = ref<any[]>([])
const deviceList = ref<any[]>([])
const currentZoneId = ref<number | null>(null)
const activeTab = ref('topology')
const topologyRef = ref<HTMLElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)

const defaultProps = {
  children: 'children',
  label: 'label',
}

const fetchTreeData = async () => {
  try {
    const res = await request.get('/api/v1/system/zone/tree')
    zoneTree.value = res || []
  } catch (error) {
    console.error('Failed to fetch zone tree:', error)
  }
}

const fetchSites = async (zoneId: number) => {
  try {
    const res = await request.get(`/api/v1/system/asset/sites`, {
      params: { zoneId, page: 1, size: 50 }
    })
    siteList.value = res?.list || []
  } catch (error) {
    console.error('Failed to fetch sites:', error)
  }
}

const fetchDevices = async (params: { zoneId?: number, siteId?: number }) => {
  try {
    const res = await request.get(`/api/v1/system/asset/devices`, {
      params: { ...params, page: 1, size: 50 }
    })
    // 映射后端字段到前端需要展示的结构
    deviceList.value = (res?.list || []).map((d: any) => ({
      id: d.id,
      site_id: d.site_id,
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

const getSiteTypeName = (type: unknown) => {
  if (typeof type === 'string' && type.trim()) return type
  const n = Number(type)
  const map: Record<number, string> = { 1: '水厂', 2: '加压泵站', 3: '二供泵房', 4: '管网监测点' }
  return map[n] || '物理站点'
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

const handleNodeClick = async (data: any) => {
  currentZoneName.value = data.label
  currentZoneId.value = data.realId
  activeTab.value = 'topology'
  await fetchSites(data.realId)
  await fetchDevices({ zoneId: data.realId })
  renderTopology()
}

const viewSiteDevices = (site: any) => {
  currentZoneName.value = site.site_name
  currentZoneId.value = site.id
  activeTab.value = 'devices'
  fetchDevices({ siteId: site.id })
}

watch(activeTab, async (val) => {
  if (val === 'topology' && currentZoneName.value) {
    await nextTick()
    renderTopology()
  }
})

const renderTopology = () => {
  if (!topologyRef.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(topologyRef.value)
  }

  // 组装 Tree 数据
  const rootNode = {
    name: currentZoneName.value,
    symbol: 'circle',
    symbolSize: 18,
    itemStyle: { 
      color: '#67c23a',
      borderColor: '#e1f3d8',
      borderWidth: 4
    },
    label: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#67c23a'
    },
    children: siteList.value.map(site => {
      const siteDevices = deviceList.value.filter(d => d.siteId === site.id || d.deviceCode.includes(site.site_code) || true); 
      // 注意: 这里暂用全挂载演示，如果设备接口返回数据带明确 site_id 则使用 `d.site_id === site.id`
      const realDevices = deviceList.value.filter(d => d.site_id === site.id);
      const devicesToMount = realDevices.length > 0 ? realDevices : [];
      
      return {
        name: site.site_name,
        symbol: 'rect',
        symbolSize: [16, 16],
        itemStyle: { 
          color: '#e6a23c',
          borderColor: '#faecd8',
          borderWidth: 3
        },
        label: {
          fontSize: 14,
          fontWeight: 600,
          color: '#b88230'
        },
        children: devicesToMount.map(dev => ({
          name: dev.deviceName,
          value: dev.deviceType,
          symbol: 'diamond',
          symbolSize: 14,
          itemStyle: { 
            color: '#409eff',
            borderColor: '#d9ecff',
            borderWidth: 2
          },
          label: {
            fontSize: 13,
            color: '#337ecc'
          }
        }))
      }
    })
  }

  const option = {
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [
      {
        type: 'tree',
        data: [rootNode],
        top: '10%',
        left: '15%',
        bottom: '10%',
        right: '25%',
        roam: true,
        symbolSize: 12,
        edgeShape: 'polyline',
        edgeForkPosition: '63%',
        initialTreeDepth: 3,
        lineStyle: {
          color: '#cbd5e1',
          width: 2,
          curveness: 0.5
        },
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 13,
          color: '#11181c'
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        emphasis: { focus: 'descendant' },
        expandAndCollapse: true,
        animationDuration: 650,
        animationDurationUpdate: 800,
        animationEasing: 'cubicOut'
      }
    ]
  }

  chartInstance.value.setOption(option)
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
  padding: 32px 40px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);
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

.topology-wrapper {
  width: 100%;
  height: calc(100vh - 280px);
  min-height: 600px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
}
.ledger-tabs {
  margin-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ledger-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
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
