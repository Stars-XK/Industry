<template>
  <div class="premium-container">
    <el-row :gutter="24" style="height: 100%;">
      <!-- 左侧：DMA分区树 -->
      <el-col :span="8" style="height: 100%;">
        <div class="glass-panel" style="height: 100%;">
          <div class="panel-header">
            <div>
              <div class="header-title">DMA 拓扑树管理</div>
              <div class="header-subtitle">DMA Topology Tree</div>
            </div>
            <el-button class="neon-btn" size="small" @click="handleAddZone(0)">新增顶级分区</el-button>
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
        <div class="glass-panel" style="height: 100%;" v-if="currentZone">
          <div class="panel-header">
            <div>
              <div class="header-title">已挂载的物理设备</div>
              <div class="header-subtitle">Mounted Physical Devices in Zone [{{ currentZone.label }}]</div>
            </div>
            <el-button class="neon-btn neon-btn-success" size="small" @click="handleBindDevice">挂载新设备</el-button>
          </div>
          <div class="table-container">
            <el-table :data="deviceData" style="width: 100%" v-loading="loadingDevices" class="industrial-table">
              <el-table-column prop="device_code" label="设备编码" width="150" />
              <el-table-column prop="name" label="设备名称" width="200" />
              <el-table-column prop="type_name" label="设备类型" width="120" />
              <el-table-column prop="direction_name" label="进出方向" width="120" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.direction === 1 ? 'success' : (scope.row.direction === -1 ? 'danger' : 'warning')" effect="dark" class="industrial-tag">
                    {{ scope.row.direction_name }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                  <el-button size="small" class="text-danger" link @click="handleUnbindDevice(scope.row)">解绑移出</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="glass-panel empty-panel" v-else>
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
          <el-button class="neon-btn" style="border-color: #64748b; color: #cbd5e1" @click="zoneDialogVisible = false">取消</el-button>
          <el-button class="neon-btn" @click="submitZoneForm">确定</el-button>
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
            <el-radio :label="1">进水表 (流入)</el-radio>
            <el-radio :label="-1">出水表 (流出)</el-radio>
            <el-radio :label="0">内部分表 (损耗/自用)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="neon-btn" style="border-color: #64748b; color: #cbd5e1" @click="bindDialogVisible = false">取消</el-button>
          <el-button class="neon-btn" @click="submitBindForm">确定挂载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// ----- 拓扑树相关 -----
const treeData = ref([])
const loadingTree = ref(false)
const currentZone = ref<any>(null)

const fetchTree = async () => {
  loadingTree.value = true
  try {
    const res = await request.get('/api/scada/topology/tree')
    treeData.value = res || []
  } catch (e) {
  } finally {
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
          await request.put(`/api/scada/topology/zone/${zoneForm.value.id}`, zoneForm.value)
        } else {
          await request.post('/api/scada/topology/zone', zoneForm.value)
        }
        ElMessage.success('保存成功')
        zoneDialogVisible.value = false
        fetchTree()
        if (currentZone.value && currentZone.value.id === zoneForm.value.id) {
          currentZone.value.label = zoneForm.value.zone_name
        }
      } catch (e) {}
    }
  })
}

const handleDeleteZone = (data: any) => {
  ElMessageBox.confirm(`确定删除分区 [${data.label}] 吗？如果存在子分区或挂载设备将拒绝删除。`, '警告', {
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/scada/topology/zone/${data.id}`)
      ElMessage.success('删除成功')
      if (currentZone.value && currentZone.value.id === data.id) {
        currentZone.value = null
        deviceData.value = []
      }
      fetchTree()
    } catch (e) {}
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
    const res = await request.get(`/api/scada/topology/devices/${currentZone.value.id}`)
    deviceData.value = res || []
  } catch (e) {
  } finally {
    loadingDevices.value = false
  }
}

const fetchAvailableAssets = async () => {
  try {
    const res = await request.get('/api/scada/topology/assets/available')
    availableAssets.value = res || []
  } catch (e) {}
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
        await request.post(`/api/scada/topology/devices/${currentZone.value.id}/bind`, bindForm.value)
        ElMessage.success('挂载成功')
        bindDialogVisible.value = false
        fetchDevices()
      } catch (e) {}
    }
  })
}

const handleUnbindDevice = (row: any) => {
  ElMessageBox.confirm(`确定将设备 [${row.name}] 从当前分区移出吗？`, '提示', {
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/scada/topology/devices/unbind/${row.rel_id}`)
      ElMessage.success('解绑成功')
      fetchDevices()
    } catch (e) {}
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 16px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.5px;
}
.header-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.tree-container {
  flex: 1;
  overflow-y: auto;
  background: rgba(2, 6, 23, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.05);
  padding: 16px;
}
.industrial-tree {
  background: transparent !important;
  color: #e2e8f0;
}
:deep(.el-tree-node__content:hover) {
  background-color: rgba(30, 41, 59, 0.5) !important;
}
:deep(.el-tree-node:focus > .el-tree-node__content) {
  background-color: rgba(0, 216, 255, 0.1) !important;
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
  color: #94a3b8;
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
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.3);
  flex: 1;
}
.industrial-table {
  background: transparent !important;
  --el-table-border-color: rgba(148, 163, 184, 0.05);
  --el-table-header-bg-color: rgba(15, 23, 42, 0.6);
  --el-table-header-text-color: #cbd5e1;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(30, 41, 59, 0.5);
  --el-table-text-color: #94a3b8;
}
:deep(.el-table th.el-table__cell) {
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
}
.neon-btn-success {
  border-color: rgba(103, 194, 58, 0.5);
  color: #67C23A;
}
.neon-btn-success:hover {
  background: rgba(103, 194, 58, 0.1);
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
  border-color: #67C23A;
}
.text-neon { color: #00d8ff; }
.text-danger { color: #F56C6C; }
.text-warning { color: #E6A23C; }
.industrial-tag {
  border: none;
}
.industrial-form :deep(.el-form-item__label) {
  color: #cbd5e1;
  font-weight: 500;
}
:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  box-shadow: none !important;
}
:deep(.el-input__inner) {
  color: #e2e8f0 !important;
}
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.3) !important;
  border-color: rgba(148, 163, 184, 0.1) !important;
}
:deep(.el-input.is-disabled .el-input__inner) {
  color: #64748b !important;
}
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #00d8ff !important;
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.2) !important;
}
:deep(.el-radio__label) {
  color: #94a3b8;
}
:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #00d8ff;
}
:deep(.el-textarea__inner) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #e2e8f0 !important;
  font-family: "SF Mono", Consolas, monospace;
}
:deep(.el-textarea__inner:focus) {
  border-color: #00d8ff !important;
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.2) !important;
}
</style>
