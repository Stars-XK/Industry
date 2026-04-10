<template>
  <div class="library-container">
    <div class="toolbar">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增分区</el-button>
      <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" icon="Upload" @click="handleImport">导入分区</el-button>
      <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
      
      <div style="flex: 1"></div>
      
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索分区名称" 
        style="width: 200px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchZones"
        @clear="fetchZones"
      />
      <el-button @click="fetchZones" style="margin-left: 12px">搜索</el-button>
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
      <el-table-column prop="id" label="分区ID" width="100" />
      <el-table-column prop="zone_code" label="分区编码" width="120" show-overflow-tooltip />
      <el-table-column prop="zone_name" label="分区名称" />
      <el-table-column prop="level" label="分区层级">
        <template #default="scope">
          <el-tag v-if="scope.row.level === 1">一级分区</el-tag>
          <el-tag v-else-if="scope.row.level === 2" type="success">二级分区</el-tag>
          <el-tag v-else-if="scope.row.level === 3" type="warning">三级分区</el-tag>
          <span v-else>{{ scope.row.level }}级分区</span>
        </template>
      </el-table-column>
      <el-table-column prop="parent_name" label="上级分区" width="180">
        <template #default="scope">
          {{ scope.row.parent_name || '无 (顶层)' }}
        </template>
      </el-table-column>
      <el-table-column prop="mnf_baseline" label="基线流量 (m³/h)" width="150" />
      <el-table-column label="地理与扩展属性" min-width="250">
        <template #default="scope">
          <div v-if="scope.row.center_lng && scope.row.center_lat" style="font-size: 12px; color: #666">
            <el-tag size="small" type="info" class="mr-1">{{ scope.row.crs || 'CGCS2000' }}</el-tag>
            {{ scope.row.center_lng }}, {{ scope.row.center_lat }}
          </div>
          <div v-else style="font-size: 12px; color: #999">暂无坐标</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
        @size-change="fetchZones"
        @current-change="fetchZones"
      />
    </div>

    <!-- 弹窗统一引用 -->
    <AssetDialogs ref="assetDialogsRef" @submit-zone="handleFormSubmit" />

    <!-- 导入组件 -->
    <ExcelImport
      v-model="importVisible"
      title="导入分区数据"
      templateName="DMA分区"
      :templateColumns="['分区编码', '分区名称', '层级(1/2/3)', '上级分区ID', '基线流量', '中心经度', '中心纬度', '坐标系']"
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
  keyword: ''
})

const fetchZones = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/system/zone/list', { params: queryParams.value })
    if (res && res.list) {
      tableData.value = res.list
      total.value = res.total
    } else {
      const data = res?.data || res
      tableData.value = data?.list || []
      total.value = data?.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch zones:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  assetDialogsRef.value?.openZoneDialog()
}

const handleEdit = (row: any) => {
  assetDialogsRef.value?.openZoneDialog(row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除分区 [${row.zone_name}] 吗？`, '警告', { type: 'warning' })
    const res = await request.delete(`/api/v1/system/zone/${row.id}`)
    if (res && res.success) {
      ElMessage.success('删除成功')
      fetchZones()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个分区吗？`, '警告', { type: 'warning' })
    const res = await request.post(`/api/v1/system/zone/batch-delete`, { ids: selectedIds.value })
    if (res && res.success) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchZones()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '批量删除失败')
  }
}

const handleFormSubmit = async (formData: any) => {
  try {
    const isEdit = !!formData.id
    if (isEdit) {
      await request.put(`/api/v1/system/zone/${formData.id}`, formData)
      ElMessage.success('更新成功')
    } else {
      await request.post('/api/v1/system/zone', formData)
      ElMessage.success('新增成功')
    }
    fetchZones()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleImport = () => {
  importVisible.value = true
}

const handleImportData = async (data: any[]) => {
  if (!data || data.length === 0) return
  
  loading.value = true
  try {
    const payload = data.map(item => ({
      zone_code: item['分区编码'] || '',
      zone_name: item['分区名称'],
      level: item['层级(1/2/3)'] || 1,
      parent_id: item['上级分区ID'] || 0,
      mnf_baseline: item['基线流量'] || 0,
      center_lng: item['中心经度'],
      center_lat: item['中心纬度'],
      crs: item['坐标系'] || 'CGCS2000'
    }))
    
    const res = await request.post('/api/v1/system/zone/batch', payload)
    ElMessage.success(`导入成功: 成功导入 ${res.successCount} 条数据`)
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败，请检查数据格式')
  } finally {
    loading.value = false
    fetchZones()
  }
}

const handleExport = () => {
  if (!tableData.value || !tableData.value.length) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const headers = {
    id: '分区ID',
    zone_code: '分区编码',
    zone_name: '分区名称',
    level: '分区层级',
    parent_name: '上级分区',
    mnf_baseline: '基线流量',
    center_lng: '中心经度',
    center_lat: '中心纬度',
    crs: '坐标系'
  }
  exportToExcel(tableData.value, 'DMA分区台账', headers)
  ElMessage.success('导出成功')
}

onMounted(() => {
  fetchZones()
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
