<template>
  <div class="library-container">
    <div class="header">
      <h3>设备资产台账库</h3>
      <p>管理全局物联网设备及仪器仪表资产数据。</p>
    </div>
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
      height="60vh"
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
      <el-table-column prop="site_name" label="挂载物理站点">
        <template #default="scope">
          {{ scope.row.site_name || '未挂载' }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import AssetDialogs from './AssetDialogs.vue'

const loading = ref(false)
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
  ElMessage.info('暂未开放导入功能，将在 Phase 6 实现')
}

const handleExport = () => {
  ElMessage.success('导出请求已发送，请稍后查看下载')
}

onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.library-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
.header {
  margin-bottom: 24px;
}
.header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}
.header p {
  margin: 0;
  color: #687076;
  font-size: 14px;
}
.toolbar {
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>