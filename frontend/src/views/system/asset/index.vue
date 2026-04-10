<template>
  <div class="asset-ledger fade-in-up">
    <div class="ledger-container">
      <div class="ledger-workspace">
        <el-tabs v-model="mainTab" class="main-tabs" type="card">
          <el-tab-pane label="资产层级与挂载拓扑" name="hierarchy">
            <!-- 原始的左右分栏布局 -->
            <div class="hierarchy-layout">
              <!-- Left Sidebar: Structural Hierarchy -->
              <ZoneTree 
          ref="zoneTreeRef" 
          @node-click="handleNodeClick" 
          @command="handleTreeCommand" 
        />

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
                <TopologyChart 
                ref="topologyChartRef"
                v-if="activeTab === 'topology'"
                :zoneName="currentZoneName" 
                :siteList="siteList" 
                :deviceList="deviceList" 
              />
              </el-tab-pane>

              <el-tab-pane label="下辖物理站点" name="sites">
                <SiteTable 
                  :siteList="siteList" 
                  @view-devices="viewSiteDevices" 
                  @delete-site="handleDeleteSite" 
                  @add-site="handleAddSite"
                />
              </el-tab-pane>
              
              <el-tab-pane label="挂载设备台账" name="devices">
                <DeviceList 
                  :deviceList="deviceList" 
                  @add-device="handleAddDevice"
                  @edit-device="handleEditDevice"
                  @delete-device="handleDeleteDevice"
                  @add-point="handleAddPoint"
                  @delete-point="handleDeletePoint"
                />
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
          </el-tab-pane>

          <el-tab-pane label="DMA分区台账库" name="zones">
            <ZoneLibrary />
          </el-tab-pane>

          <el-tab-pane label="物理站点台账库" name="sites">
            <SiteLibrary />
          </el-tab-pane>

          <el-tab-pane label="设备资产台账库" name="devices">
            <DeviceLibrary />
          </el-tab-pane>

          <el-tab-pane label="测点数据字典库" name="points">
            <PointLibrary />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <!-- Dialogs -->
    <AssetDialogs 
      ref="assetDialogsRef" 
      @submit-zone="onSubmitZone"
      @submit-site="onSubmitSite"
      @submit-device="onSubmitDevice"
      @submit-point="onSubmitPoint"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Plus, Filter, DataBoard, Upload } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

// Components
import ZoneTree from './components/ZoneTree.vue'
import TopologyChart from './components/TopologyChart.vue'
import SiteTable from './components/SiteTable.vue'
import DeviceList from './components/DeviceList.vue'
import AssetDialogs from './components/AssetDialogs.vue'
import SiteLibrary from './components/SiteLibrary.vue'
import DeviceLibrary from './components/DeviceLibrary.vue'
import PointLibrary from './components/PointLibrary.vue'
import ZoneLibrary from './components/ZoneLibrary.vue'

const currentZoneName = ref('')
const currentZoneId = ref<number | null>(null)
const currentSiteId = ref<number | null>(null) // To track which site's devices we are viewing
const siteList = ref<any[]>([])
const deviceList = ref<any[]>([])
const mainTab = ref('hierarchy')
const activeTab = ref('topology')

const zoneTreeRef = ref<any>(null)
const topologyChartRef = ref<any>(null)
const assetDialogsRef = ref<any>(null)

const getDeviceTypeName = (type: number) => {
  const map: Record<number, string> = { 1: '智能水表', 2: '压力计', 3: '水泵', 4: '水质仪' }
  return map[type] || '未知设备'
}

const getPointCategoryName = (category: number) => {
  const map: Record<number, string> = { 1: '瞬时流量', 2: '压力', 3: '水质', 4: '状态值', 5: '累计流量' }
  return map[category] || '其他'
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
    deviceList.value = (res?.list || []).map((d: any) => ({
      id: d.id,
      site_id: d.site_id,
      deviceCode: d.device_code,
      deviceName: d.device_name,
      deviceType: getDeviceTypeName(d.device_type),
      installDate: d.install_date,
      status: d.status === 1 ? '在线' : '离线',
      points: (d.points || []).map((p: any) => ({
        id: p.id,
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

// Event Handlers
const handleNodeClick = async (data: any) => {
  currentZoneName.value = data.label
  currentZoneId.value = data.realId
  currentSiteId.value = null
  activeTab.value = 'topology'
  await fetchSites(data.realId)
  await fetchDevices({ zoneId: data.realId })
}

const viewSiteDevices = (site: any) => {
  currentZoneName.value = site.site_name
  currentZoneId.value = site.zone_id || currentZoneId.value
  currentSiteId.value = site.id
  activeTab.value = 'devices'
  fetchDevices({ siteId: site.id })
}

watch(activeTab, async (val) => {
  if (val === 'topology' && currentZoneName.value) {
    await nextTick()
    if (topologyChartRef.value) {
      topologyChartRef.value.renderTopology()
    }
  }
})

// Dialog Actions
const handleRegisterAsset = () => {
  // Generic entry point, let's open zone dialog by default or site if zone is selected
  if (currentZoneId.value) {
    assetDialogsRef.value?.openSiteDialog(currentZoneId.value)
  } else {
    assetDialogsRef.value?.openZoneDialog(0)
  }
}

const handleTreeCommand = (command: string, data: any) => {
  if (command === 'addZone') {
    assetDialogsRef.value?.openZoneDialog(data.realId)
  } else if (command === 'addSite') {
    assetDialogsRef.value?.openSiteDialog(data.realId)
  } else if (command === 'edit') {
    // Edit zone, API logic omitted for brevity, passing basic struct
    assetDialogsRef.value?.openZoneDialog(data.parentId || 0, {
      id: data.realId,
      zone_name: data.label,
      level: data.level
    })
  } else if (command === 'delete') {
    ElMessageBox.confirm('确定要删除该分区节点吗?', '警告', { type: 'warning' })
      .then(async () => {
        // await request.delete(`/api/v1/system/zone/${data.realId}`)
        ElMessage.success('已发送删除请求')
        zoneTreeRef.value?.fetchTreeData()
      })
      .catch(() => {})
  }
}

const handleDeleteSite = (site: any) => {
  ElMessageBox.confirm('确定要删除该站点吗?', '警告', { type: 'warning' })
    .then(async () => {
      ElMessage.success('已发送删除站点请求')
      if (currentZoneId.value) {
        await fetchSites(currentZoneId.value)
      }
    })
    .catch(() => {})
}

const handleAddSite = () => {
  if (!currentZoneId.value) {
    ElMessage.warning('请先在左侧选择一个所属的分区')
    return
  }
  assetDialogsRef.value?.openSiteDialog(currentZoneId.value)
}

const handleAddDevice = () => {
  if (!currentSiteId.value && !currentZoneId.value) {
    ElMessage.warning('请先选择一个物理站点或分区')
    return
  }
  // Ideally, devices belong to sites, so we need a siteId
  // If we only selected a zone, we might require selecting a site first, or allow zone mounting
  assetDialogsRef.value?.openDeviceDialog(currentSiteId.value || 0)
}

const handleEditDevice = (device: any) => {
  assetDialogsRef.value?.openDeviceDialog(device.site_id, {
    id: device.id,
    device_code: device.deviceCode,
    device_name: device.deviceName,
    device_type: 1 // Needs reverse mapping if needed
  })
}

const handleDeleteDevice = (device: any) => {
  ElMessageBox.confirm('确定要删除该设备吗?', '警告', { type: 'warning' })
    .then(async () => {
      ElMessage.success('已发送删除设备请求')
      if (currentSiteId.value) {
        await fetchDevices({ siteId: currentSiteId.value })
      } else if (currentZoneId.value) {
        await fetchDevices({ zoneId: currentZoneId.value })
      }
    })
    .catch(() => {})
}

const handleAddPoint = (device: any) => {
  assetDialogsRef.value?.openPointDialog(device.id)
}

const handleDeletePoint = (device: any, point: any) => {
  ElMessageBox.confirm('确定要删除该测点吗?', '警告', { type: 'warning' })
    .then(async () => {
      ElMessage.success('已发送删除测点请求')
      if (currentSiteId.value) {
        await fetchDevices({ siteId: currentSiteId.value })
      } else if (currentZoneId.value) {
        await fetchDevices({ zoneId: currentZoneId.value })
      }
    })
    .catch(() => {})
}

// Dialog Submits
const onSubmitZone = async (formData: any) => {
  console.log('Submit Zone:', formData)
  ElMessage.success('分区保存成功(模拟)')
  zoneTreeRef.value?.fetchTreeData()
}

const onSubmitSite = async (formData: any) => {
  console.log('Submit Site:', formData)
  ElMessage.success('站点保存成功(模拟)')
  if (currentZoneId.value) {
    await fetchSites(currentZoneId.value)
  }
}

const onSubmitDevice = async (formData: any) => {
  console.log('Submit Device:', formData)
  ElMessage.success('设备保存成功(模拟)')
  if (currentSiteId.value) {
    await fetchDevices({ siteId: currentSiteId.value })
  } else if (currentZoneId.value) {
    await fetchDevices({ zoneId: currentZoneId.value })
  }
}

const onSubmitPoint = async (formData: any) => {
  console.log('Submit Point:', formData)
  ElMessage.success('测点保存成功(模拟)')
  if (currentSiteId.value) {
    await fetchDevices({ siteId: currentSiteId.value })
  } else if (currentZoneId.value) {
    await fetchDevices({ zoneId: currentZoneId.value })
  }
}
</script>

<style scoped>
/* Premium Linear-style Reset & Typography */
.asset-ledger {
  display: flex;
  flex-direction: column;
  min-height: 100%;
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

/* Header 样式移除，保持与其它组件干净 */

/* Workspace Layout */
.ledger-workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.main-tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.main-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: #fafafa;
  border-bottom: 1px solid var(--el-border-color-light);
}
.main-tabs :deep(.el-tabs__nav-wrap) {
  padding-left: 20px;
}
.main-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.main-tabs :deep(.el-tab-pane) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.hierarchy-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Right Main Content */
.ledger-content {
  flex: 1;
  background: #ffffff;
  overflow-y: auto;
  padding: 2%;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
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

.ledger-tabs {
  margin-top: 16px;
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
  color: #11181c;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
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
