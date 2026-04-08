<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 左侧：DMA分区树 -->
      <el-col :span="8">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>DMA 拓扑树管理</span>
              <el-button type="primary" size="small" @click="handleAddZone(0)">新增顶级分区</el-button>
            </div>
          </template>
          <div class="tree-container" v-loading="loadingTree">
            <el-tree
              :data="treeData"
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span>{{ data.label }} (Lv.{{ data.level }})</span>
                  <span>
                    <el-button type="primary" link size="small" @click.stop="handleAddZone(data.id, data.level)">新增子区</el-button>
                    <el-button type="warning" link size="small" @click.stop="handleEditZone(data)">编辑</el-button>
                    <el-button type="danger" link size="small" @click.stop="handleDeleteZone(data)">删除</el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：挂载设备管理 -->
      <el-col :span="16">
        <el-card class="box-card" shadow="never" v-if="currentZone">
          <template #header>
            <div class="card-header">
              <span>分区 [{{ currentZone.label }}] 已挂载的物理设备</span>
              <el-button type="success" size="small" @click="handleBindDevice">挂载新设备</el-button>
            </div>
          </template>
          <el-table :data="deviceData" style="width: 100%" v-loading="loadingDevices" border>
            <el-table-column prop="device_code" label="设备编码" width="150" />
            <el-table-column prop="name" label="设备名称" width="200" />
            <el-table-column prop="type_name" label="设备类型" width="120" />
            <el-table-column prop="direction_name" label="进出方向" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.direction === 1 ? 'primary' : (scope.row.direction === -1 ? 'warning' : 'info')">
                  {{ scope.row.direction_name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" type="danger" link @click="handleUnbindDevice(scope.row)">解绑移出</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-empty v-else description="请先从左侧选择一个 DMA 分区" />
      </el-col>
    </el-row>

    <!-- 分区配置弹窗 -->
    <el-dialog :title="zoneDialogTitle" v-model="zoneDialogVisible" width="500px" @close="resetZoneForm">
      <el-form ref="zoneFormRef" :model="zoneForm" :rules="zoneRules" label-width="120px">
        <el-form-item label="父级分区ID">
          <el-input v-model="zoneForm.parent_id" disabled />
        </el-form-item>
        <el-form-item label="分区名称" prop="zone_name">
          <el-input v-model="zoneForm.zone_name" placeholder="如 某某小区" />
        </el-form-item>
        <el-form-item label="分区层级" prop="level">
          <el-input-number v-model="zoneForm.level" :min="1" :max="5" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="MNF基线(预设)">
          <el-input-number v-model="zoneForm.mnf_baseline" :min="0" :precision="2" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="GIS边界数据">
          <el-input type="textarea" v-model="zoneForm.boundary_gis" placeholder="GeoJSON 格式" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="zoneDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitZoneForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 挂载设备弹窗 -->
    <el-dialog title="挂载物理设备" v-model="bindDialogVisible" width="600px" @close="resetBindForm">
      <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" label-width="100px">
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
          <el-button @click="bindDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBindForm">确定挂载</el-button>
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
    type: 'warning'
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
    type: 'warning'
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
.page-container { padding: 20px; height: calc(100vh - 120px); }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.tree-container { height: 600px; overflow-y: auto; }
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
