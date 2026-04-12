<template>
  <div class="library-container">
    <div class="toolbar">
      <el-button type="primary" icon="Plus" @click="handleAdd">录入新设备</el-button>
      <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">批量报废</el-button>
      <el-button type="success" icon="Upload" @click="handleImport">批量导入</el-button>
      <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>

      <div style="flex: 1"></div>

      <el-select v-model="queryParams.device_type" placeholder="设备类型" style="width: 140px; margin-left: 12px" clearable @change="fetchDevices">
        <el-option label="智能水表" :value="1" />
        <el-option label="压力计" :value="2" />
        <el-option label="水泵" :value="3" />
        <el-option label="水质仪" :value="4" />
      </el-select>

      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索设备编码或名称" 
        style="width: 200px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchDevices"
        @clear="fetchDevices"
      />
      <el-button @click="fetchDevices" style="margin-left: 12px">搜索</el-button>
    </div>
    <el-table 
      :data="tableData" 
      v-loading="loading" 
      border 
      stripe 
      style="width: 100%; margin-top: 16px" 
      height="calc(100% - 110px)"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="device_code" label="设备编码" width="180" />
      <el-table-column prop="device_name" label="设备名称" />
      <el-table-column prop="device_type" label="设备类型">
        <template #default="scope">
          <el-tag v-if="scope.row.device_type === 1">智能水表</el-tag>
          <el-tag v-else-if="scope.row.device_type === 2" type="warning">压力计</el-tag>
          <el-tag v-else-if="scope.row.device_type === 3" type="success">水泵</el-tag>
          <span v-else>{{ scope.row.device_type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="site_name" label="所属站点" width="180">
        <template #default="{ row }">
          {{ row.site_name || row.site_code || '未挂载' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">在线</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="info">离线</el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="warning">维修中</el-tag>
          <span v-else>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地理与扩展属性" min-width="250">
        <template #default="scope">
          <div v-if="scope.row.lng && scope.row.lat" style="font-size: 12px; color: #666">
            <el-tag size="small" type="info" class="mr-1">{{ scope.row.crs || 'CGCS2000' }}</el-tag>
            {{ scope.row.lng }}, {{ scope.row.lat }}
          </div>
          <div v-else-if="scope.row.manufacturer" style="font-size: 12px; color: #666">
            {{ scope.row.manufacturer }} / {{ scope.row.model || '-' }}
          </div>
          <div v-else style="font-size: 12px; color: #999">暂无扩展信息</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">报废</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="fetchDevices"
        @current-change="fetchDevices"
      />
    </div>

    <!-- 弹窗统一引用 -->
    <AssetDialogs ref="assetDialogsRef" @submit-device="handleFormSubmit" />

    <ExcelImport
      v-model="importVisible"
      title="导入设备数据"
      templateName="设备资产"
      :templateColumns="['设备编码', '设备名称', '设备类型(1/2/3/4)', '所属站点编码', '状态(1/2/3)', '生产厂家', '规格型号', '经度', '纬度', '坐标系']"
      @import-data="handleImportData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import AssetDialogs from './AssetDialogs.vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { exportToExcel } from '@/utils/export'

const loading = ref(false)
const importVisible = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const assetDialogsRef = ref<any>(null)
const queryParams = ref({
  page: 1,
  size: 20,
  keyword: '',
  device_type: ''
})

const fetchDevices = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/system/asset/devices', { params: queryParams.value })
    if (res && res.list) {
      tableData.value = res.list
      total.value = res.total
    } else {
      const data = res?.data || res
      tableData.value = data.list || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch devices:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  assetDialogsRef.value?.openDeviceDialog()
}

const handleEdit = (row: any) => {
  assetDialogsRef.value?.openDeviceDialog(row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认报废设备 [${row.device_name}] 吗？`, '警告', { type: 'warning' })
    const res = await request.delete(`/api/v1/system/asset/device/${row.id}`)
    if (res && res.success) {
      ElMessage.success('报废成功')
      fetchDevices()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`确认报废选中的 ${selectedIds.value.length} 个设备吗？`, '警告', { type: 'warning' })
    const res = await request.post(`/api/v1/system/asset/device/batch-delete`, { ids: selectedIds.value })
    if (res && res.success) {
      ElMessage.success('批量报废成功')
      selectedIds.value = []
      fetchDevices()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '批量报废失败')
  }
}

const handleFormSubmit = async (formData: any) => {
  try {
    const isEdit = !!formData.id
    if (isEdit) {
      await request.put(`/api/v1/system/asset/device/${formData.id}`, formData)
      ElMessage.success('更新成功')
    } else {
      await request.post('/api/v1/system/asset/device', formData)
      ElMessage.success('录入成功')
    }
    fetchDevices()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleImport = () => {
  importVisible.value = true
}

const handleImportData = async (data: any[]) => {
  if (!data || data.length === 0) return
  let successCount = 0
  let failCount = 0
  
  loading.value = true
  for (const item of data) {
    try {
      const payload = {
        device_code: item['设备编码'],
        device_name: item['设备名称'],
        device_type: item['设备类型(1/2/3/4)'] || 1,
        site_code: item['所属站点编码'] || null,
        status: item['状态(1/2/3)'] || 1,
        manufacturer: item['生产厂家'],
        model: item['规格型号'],
        lng: item['经度'],
        lat: item['纬度'],
        crs: item['坐标系'] || 'CGCS2000'
      }
      await request.post('/api/v1/system/asset/device', payload)
      successCount++
    } catch (e) {
      failCount++
    }
  }
  loading.value = false
  ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`)
  fetchDevices()
}

const handleExport = () => {
  if (!tableData.value || !tableData.value.length) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const typeMap: Record<number, string> = { 1: '智能水表', 2: '压力计', 3: '水泵', 4: '水质仪' }
  const statusMap: Record<number, string> = { 1: '在线', 2: '离线', 3: '维修中' }
  const exportData = tableData.value.map((item: any) => ({
    ...item,
    device_type_name: typeMap[item.device_type] || item.device_type,
    status_name: statusMap[item.status] || item.status
  }))
  const headers = {
    id: '设备ID',
    device_code: '设备编码',
    device_name: '设备名称',
    device_type_name: '设备类型',
    site_name: '所属站点',
    status_name: '状态',
    manufacturer: '生产厂家',
    model: '规格型号',
    lng: '经度',
    lat: '纬度',
    crs: '坐标系'
  }
  exportToExcel(exportData, '设备资产台账', headers)
  ElMessage.success('导出成功')
}

onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.library-container {
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>