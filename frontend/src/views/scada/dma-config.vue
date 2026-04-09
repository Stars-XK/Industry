<template>
  <div class="app-container fade-in-up">
    <el-row :gutter="24" style="height: 100%;">
      <!-- 左侧：DMA分区树 -->
      <el-col :span="8" style="height: 100%;">
        <div class="box-card" style="height: 100%;">
          <div class="panel-header">
            <div>
              <div class="header-title">DMA 拓扑树管理</div>
              <div class="header-subtitle">DMA Topology Tree</div>
            </div>
            <el-button  size="small" @click="handleAddZone(0)">新增顶级分区</el-button>
          <el-button  @click="showImport = true" icon="Upload">批量导入</el-button>
          </div>
          <div class="tree-container" v-loading="loadingTree">
            <el-tree
              :data="treeData"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
              class="industrial-tree"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span class="node-label">{{ data.label }} <span class="node-level">(Lv.{{ data.level }})</span></span>
                  <span class="node-actions">
                    <el-button class="text-neon" link size="small" @click.stop="handleAddZone(data.id, data.level)">新增子区</el-button>
                    <el-button class="text-warning" link size="small" @click.stop="handleEditZone(data)">编辑</el-button>
                    <el-button class="text-danger" link size="small" @click.stop="handleDeleteZone(data)">删除</el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </el-col>
      <!-- 右侧：挂载设备管理 -->
      <el-col :span="16" style="height: 100%;">
        <div class="box-card" style="height: 100%;" v-if="currentZone">
          <div class="panel-header">
            <div>
              <div class="header-title">已挂载的物理设备</div>
              <div class="header-subtitle">Mounted Physical Devices in Zone [{{ currentZone.label }}]</div>
            </div>
            <el-button class=" -success" size="small" @click="handleBindDevice">挂载新设备</el-button>
          </div>
          <div class="table-container">
            <el-table :data="deviceData" style="width: 100%" v-loading="loadingDevices" class="industrial-table">
              <el-table-column prop="device_code" label="设备编码" width="150"  show-overflow-tooltip />
              <el-table-column prop="name" label="设备名称" width="200"  show-overflow-tooltip />
              <el-table-column prop="type_name" label="设备类型" width="120"  show-overflow-tooltip />
              <el-table-column prop="direction_name" label="进出方向" width="120" align="center" show-overflow-tooltip>
                <template #default="scope">
                  <el-tag :type="scope.row.direction === 1 ? 'success' : (scope.row.direction === -1 ? 'danger' : 'warning')" effect="dark" class="industrial-tag">
                    {{ scope.row.direction_name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center" show-overflow-tooltip>
                <template #default="scope">
                  <el-button size="small" class="text-danger" link @click="handleUnbindDevice(scope.row)">解绑移出</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="box-card" v-else>
          <el-empty description="请先从左侧选择一个 DMA 分区" />
        </div>
      </el-col>
    </el-row>
    <!-- 分区配置弹窗 -->
    <el-dialog :title="zoneDialogTitle" v-model="zoneDialogVisible" width="500px" @close="resetZoneForm" custom-class="industrial-dialog">
      <el-form ref="zoneFormRef" :model="zoneForm" :rules="zoneRules" label-width="120px" class="industrial-form">
        <el-form-item label="父级分区ID">
          <el-input v-model="zoneForm.parent_id" disabled />
        </el-form-item>
        <el-form-item label="分区名称" prop="zone_name">
          <el-input v-model="zoneForm.zone_name" placeholder="如 某某小区" />
        </el-form-item>
        <el-form-item label="分区层级" prop="level">
          <el-input-number v-model="zoneForm.level" :min="1" :max="5" disabled style="width: 100%" class="industrial-input-number" />
        </el-form-item>
        <el-form-item label="MNF基线(预设)">
          <el-input-number v-model="zoneForm.mnf_baseline" :min="0" :precision="2" :step="0.5" style="width: 100%" class="industrial-input-number" />
        </el-form-item>
        <el-form-item label="GIS边界数据">
          <el-input type="textarea" v-model="zoneForm.boundary_gis" placeholder="GeoJSON 格式" :rows="3" class="industrial-textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button  style="border-color: var(--el-border-color); color: var(--el-text-color-regular)" @click="zoneDialogVisible = false">取消</el-button>
          <el-button  @click="submitZoneForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 挂载设备弹窗 -->
    <el-dialog title="挂载物理设备" v-model="bindDialogVisible" width="600px" @close="resetBindForm" custom-class="industrial-dialog">
      <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" label-width="100px" class="industrial-form">
        <el-form-item label="选择设备" prop="device_id">
          <el-select v-model="bindForm.device_id" filterable placeholder="请搜索并选择可用的设备" style="width: 100%">
            <el-option
              v-for="item in availableAssets"
              :key="item.id"
              :label="`[${item.device_code}] ${item.device_name} (${item.type_name})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="挂载方向" prop="direction">
          <el-radio-group v-model="bindForm.direction">
            <el-radio :value="1">进水表 (流入)</el-radio>
            <el-radio :value="-1">出水表 (流出)</el-radio>
            <el-radio :value="0">内部分表 (损耗/自用)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button  style="border-color: var(--el-border-color); color: var(--el-text-color-regular)" @click="bindDialogVisible = false">取消</el-button>
          <el-button  @click="submitBindForm">确定挂载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入DMA分区数据"
      templateName="DMA分区"
      :templateColumns="['上级分区ID', '分区名称', '分级(1/2/3)', '关联经纬度', '备注']"
      @success="fetchTree"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
// ----- 拓扑树相关 -----
const treeData = ref([])
const loadingTree = ref(false)
const currentZone = ref<any>(null)
const fetchTree = async () => {
  loadingTree.value = true
  try {
    const res = await request.get('/api/v1/scada/topology/tree')
    treeData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loadingTree.value = false
  }
}
// ----- 分区 CRUD -----
const zoneDialogVisible = ref(false)
const zoneDialogTitle = ref('新增分区')
const zoneFormRef = ref()
const zoneForm = ref({
  id: '',
  parent_id: 0,
  zone_name: '',
  level: 1,
  boundary_gis: '',
  mnf_baseline: 0
})
const zoneRules = {
  zone_name: [{ required: true, message: '必填', trigger: 'blur' }]
}
const handleAddZone = (parentId: number, parentLevel: number = 0) => {
  zoneDialogTitle.value = '新增分区'
  zoneForm.value = { id: '', parent_id: parentId, zone_name: '', level: parentLevel + 1, boundary_gis: '', mnf_baseline: 0 }
  zoneDialogVisible.value = true
}
const handleEditZone = (data: any) => {
  zoneDialogTitle.value = '编辑分区'
  zoneForm.value = { id: data.id, parent_id: data.parent_id || 0, zone_name: data.label, level: data.level, boundary_gis: data.boundary_gis, mnf_baseline: data.mnf_baseline }
  zoneDialogVisible.value = true
}
const submitZoneForm = async () => {
  if (!zoneFormRef.value) return
  await zoneFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (zoneForm.value.id) {
          await request.put(`/api/v1/scada/topology/zone/${zoneForm.value.id}`, zoneForm.value)
        } else {
          await request.post('/api/v1/scada/topology/zone', zoneForm.value)
        }
        ElMessage.success('保存成功')
        zoneDialogVisible.value = false
        fetchTree()
        if (currentZone.value && currentZone.value.id === zoneForm.value.id) {
          currentZone.value.label = zoneForm.value.zone_name
        }
      } catch (e) { /* fallback */ }
    }
  })
}
const handleDeleteZone = (data: any) => {
  ElMessageBox.confirm(`确定删除分区 [${data.label}] 吗？如果存在子分区或挂载设备将拒绝删除。`, '警告', {
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/v1/scada/topology/zone/${data.id}`)
      ElMessage.success('删除成功')
      if (currentZone.value && currentZone.value.id === data.id) {
        currentZone.value = null
        deviceData.value = []
      }
      fetchTree()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const resetZoneForm = () => {
  if (zoneFormRef.value) zoneFormRef.value.resetFields()
}
// ----- 挂载设备相关 -----
const deviceData = ref([])
const loadingDevices = ref(false)
const availableAssets = ref<any[]>([])
const bindDialogVisible = ref(false)
const bindFormRef = ref()
const bindForm = ref({
  device_id: null,
  direction: 1
})
const bindRules = {
  device_id: [{ required: true, message: '请选择设备', trigger: 'change' }]
}
const handleNodeClick = (data: any) => {
  currentZone.value = data
  fetchDevices()
}
const fetchDevices = async () => {
  if (!currentZone.value) return
  loadingDevices.value = true
  try {
    const res = await request.get(`/api/v1/scada/topology/devices/${currentZone.value.id}`)
    deviceData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loadingDevices.value = false
  }
}
const fetchAvailableAssets = async () => {
  try {
    const res = await request.get('/api/v1/scada/topology/assets/available')
    availableAssets.value = res || []
  } catch (e) { /* fallback */ }
}
const handleBindDevice = async () => {
  await fetchAvailableAssets()
  bindDialogVisible.value = true
}
const submitBindForm = async () => {
  if (!bindFormRef.value) return
  await bindFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post(`/api/v1/scada/topology/devices/${currentZone.value.id}/bind`, bindForm.value)
        ElMessage.success('挂载成功')
        bindDialogVisible.value = false
        fetchDevices()
      } catch (e) { /* fallback */ }
    }
  })
}
const handleUnbindDevice = (row: any) => {
  ElMessageBox.confirm(`确定将设备 [${row.name}] 从当前分区移出吗？`, '提示', {
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/v1/scada/topology/devices/unbind/${row.rel_id}`)
      ElMessage.success('解绑成功')
      fetchDevices()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const resetBindForm = () => {
  if (bindFormRef.value) bindFormRef.value.resetFields()
  bindForm.value = { device_id: null, direction: 1 }
}
onMounted(() => {
  fetchTree()
})
</script>
<style scoped>

.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar, .header-actions {
  display: flex;
  gap: 12px;
}
.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}
/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 16px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}
.header-subtitle {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.tree-container {
  flex: 1;
  overflow-y: auto;
  background: var(--el-fill-color-blank);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  padding: 16px;
}
.industrial-tree {
  background: var(--el-fill-color-blank) ;
  color: var(--el-text-color-primary);
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.node-label {
  letter-spacing: 0.5px;
}
.node-level {
  color: var(--el-text-color-regular);
  font-size: 12px;
  margin-left: 8px;
  font-family: "SF Mono", Consolas, monospace;
}
.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}
.custom-tree-node:hover .node-actions {
  opacity: 1;
}
.table-container {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  flex: 1;
  width: 100%;
}
.industrial-table {
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
}
.-success {
  border-color: var(--el-color-success-light-5);
  color: var(--el-color-success);
}
.-success:hover {
  background: var(--el-color-success-light-9);
  box-shadow: 0 0 15px var(--el-color-success-light-5);
  border-color: var(--el-color-success);
}
.text-neon { color: var(--el-color-primary); }
.text-danger { color: var(--el-color-danger); }
.text-warning { color: var(--el-color-warning); }
.industrial-tag {
  border: none;
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
