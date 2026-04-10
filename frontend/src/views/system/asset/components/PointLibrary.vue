<template>
  <div class="library-container">
    <div class="toolbar">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增测点</el-button>
      <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" icon="Upload" @click="handleImport">批量导入</el-button>
      <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>

      <div style="flex: 1"></div>

      <el-select v-model="queryParams.point_category" placeholder="测点类型" style="width: 140px; margin-left: 12px" clearable @change="fetchPoints">
        <el-option label="流量" :value="1" />
        <el-option label="压力" :value="2" />
        <el-option label="水质" :value="3" />
        <el-option label="状态值" :value="4" />
        <el-option label="电量" :value="5" />
      </el-select>

      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索测点编码或名称" 
        style="width: 200px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchPoints"
        @clear="fetchPoints"
      />
      <el-button @click="fetchPoints" style="margin-left: 12px">搜索</el-button>
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
      <el-table-column prop="point_code" label="测点编码" width="180" />
      <el-table-column prop="point_name" label="测点名称" />
      <el-table-column prop="point_category" label="测点类型">
        <template #default="scope">
          <el-tag v-if="scope.row.point_category === 1">流量</el-tag>
          <el-tag v-else-if="scope.row.point_category === 2" type="warning">压力</el-tag>
          <el-tag v-else-if="scope.row.point_category === 3" type="success">水质</el-tag>
          <el-tag v-else-if="scope.row.point_category === 4" type="info">状态值</el-tag>
          <el-tag v-else-if="scope.row.point_category === 5" type="danger">电量</el-tag>
          <span v-else>{{ scope.row.point_category }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="data_type" label="数据类型" width="120" />
      <el-table-column prop="unit" label="物理单位" width="100" />
      <el-table-column prop="device_name" label="关联设备">
        <template #default="scope">
          {{ scope.row.device_name ? `${scope.row.device_name} (${scope.row.device_code})` : '未关联' }}
        </template>
      </el-table-column>
      <el-table-column label="量程与扩展属性" min-width="250">
        <template #default="scope">
          <div v-if="scope.row.range_min !== null || scope.row.range_max !== null" style="font-size: 12px; color: #666">
            量程: {{ scope.row.range_min ?? '-' }} ~ {{ scope.row.range_max ?? '-' }} {{ scope.row.unit }}
          </div>
          <div v-else style="font-size: 12px; color: #999">未设置量程</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">修改映射</el-button>
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
        @size-change="fetchPoints"
        @current-change="fetchPoints"
      />
    </div>

    <!-- 弹窗统一引用 -->
    <AssetDialogs ref="assetDialogsRef" @submit-point="handleFormSubmit" />

    <ExcelImport
      v-model="importVisible"
      title="导入测点数据"
      templateName="测点字典"
      :templateColumns="['测点编码', '测点名称', '测点类型(1/2/3/4/5)', '关联设备ID', '数据类型', '物理单位', '量程下限', '量程上限']"
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
  point_category: ''
})

const fetchPoints = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/system/asset/points', { params: queryParams.value })
    if (res && res.list) {
      tableData.value = res.list
      total.value = res.total
    } else {
      const data = res?.data || res
      tableData.value = data.list || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch points:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  assetDialogsRef.value?.openPointDialog()
}

const handleEdit = (row: any) => {
  assetDialogsRef.value?.openPointDialog(row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除测点 [${row.point_name}] 吗？`, '警告', { type: 'warning' })
    const res = await request.delete(`/api/v1/system/asset/point/${row.id}`)
    if (res && res.success) {
      ElMessage.success('删除成功')
      fetchPoints()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个测点吗？`, '警告', { type: 'warning' })
    const res = await request.post(`/api/v1/system/asset/point/batch-delete`, { ids: selectedIds.value })
    if (res && res.success) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchPoints()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '批量删除失败')
  }
}

const handleFormSubmit = async (formData: any) => {
  try {
    const isEdit = !!formData.id
    if (isEdit) {
      await request.put(`/api/v1/system/asset/point/${formData.id}`, formData)
      ElMessage.success('更新成功')
    } else {
      await request.post('/api/v1/system/asset/point', formData)
      ElMessage.success('新增成功')
    }
    fetchPoints()
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
      point_code: item['测点编码'],
      point_name: item['测点名称'],
      point_category: item['测点类型(1/2/3/4/5)'] || 1,
      device_id: item['关联设备ID'] || null,
      data_type: item['数据类型'] || 'float',
      unit: item['物理单位'] || '',
      range_min: item['量程下限'] || null,
      range_max: item['量程上限'] || null
    }))
    
    const res = await request.post('/api/v1/system/asset/point/batch', payload)
    ElMessage.success(`导入成功: 成功导入 ${res.successCount} 条数据`)
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败，请检查数据格式')
  } finally {
    loading.value = false
    fetchPoints()
  }
}

const handleExport = () => {
  if (!tableData.value || !tableData.value.length) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const categoryMap: Record<number, string> = { 1: '瞬时流量', 2: '压力', 3: '水质', 4: '状态值', 5: '累计流量' }
  const exportData = tableData.value.map((item: any) => ({
    ...item,
    point_category_name: categoryMap[item.point_category] || item.point_category
  }))
  const headers = {
    id: '测点ID',
    point_code: '测点编码',
    point_name: '测点名称',
    point_category_name: '测点类型',
    data_type: '数据类型',
    unit: '物理单位',
    device_name: '关联设备',
    device_code: '关联设备编码',
    range_min: '量程下限',
    range_max: '量程上限'
  }
  exportToExcel(exportData, '测点数据字典库', headers)
  ElMessage.success('导出成功')
}

onMounted(() => {
  fetchPoints()
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