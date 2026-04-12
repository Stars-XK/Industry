<template>
  <div class="library-container">
    <div class="toolbar">
      <el-button type="primary" icon="Plus" @click="handleAdd">注册新站点</el-button>
      <el-button type="danger" icon="Delete" :disabled="!selectedIds.length" @click="handleBatchDelete">批量删除</el-button>
      <el-button type="success" icon="Upload" @click="handleImport">批量导入</el-button>
      <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>

      <div style="flex: 1"></div>

      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索站点编码或名称" 
        style="width: 200px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchSites"
        @clear="fetchSites"
      />
      <el-button @click="fetchSites" style="margin-left: 12px">搜索</el-button>
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
      <el-table-column prop="site_code" label="站点编码" width="180" />
      <el-table-column prop="site_name" label="站点名称" />
      <el-table-column prop="site_type" label="站点类型">
        <template #default="scope">
          <el-tag v-if="scope.row.site_type === 1">水厂</el-tag>
          <el-tag v-else-if="scope.row.site_type === 2" type="success">加压泵站</el-tag>
          <el-tag v-else-if="scope.row.site_type === 3" type="warning">二供泵房</el-tag>
          <el-tag v-else-if="scope.row.site_type === 4" type="info">管网监测点</el-tag>
          <span v-else>{{ scope.row.site_type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="zone_name" label="所属分区" width="180">
        <template #default="{ row }">
          {{ row.zone_name || row.zone_code || '未挂载' }}
        </template>
      </el-table-column>
      <el-table-column label="地理与扩展属性" min-width="250">
        <template #default="scope">
          <div v-if="scope.row.lng && scope.row.lat" style="font-size: 12px; color: #666">
            <el-tag size="small" type="info" class="mr-1">{{ scope.row.crs || 'CGCS2000' }}</el-tag>
            {{ scope.row.lng }}, {{ scope.row.lat }}
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
        @size-change="fetchSites"
        @current-change="fetchSites"
      />
    </div>

    <!-- 弹窗统一引用 -->
    <AssetDialogs ref="assetDialogsRef" @submit-site="handleFormSubmit" />

    <ExcelImport
      v-model="importVisible"
      title="导入站点数据"
      templateName="物理站点"
      :templateColumns="['站点编码', '站点名称', '站点类型(1/2/3/4)', '挂载分区编码', '详细地址', '经度', '纬度', '坐标系']"
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

const fetchSites = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/system/asset/sites', { params: queryParams.value })
    if (res && res.list) {
      tableData.value = res.list
      total.value = res.total
    } else {
      // In case of wrapper like { code: 200, data: { list, total } }
      const data = res?.data || res
      tableData.value = data.list || []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch sites:', error)
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  assetDialogsRef.value?.openSiteDialog()
}

const handleEdit = (row: any) => {
  assetDialogsRef.value?.openSiteDialog(row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除物理站点 [${row.site_name}] 吗？`, '警告', { type: 'warning' })
    const res = await request.delete(`/api/v1/system/asset/site/${row.id}`)
    if (res && res.success) {
      ElMessage.success('删除成功')
      fetchSites()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个站点吗？`, '警告', { type: 'warning' })
    const res = await request.post(`/api/v1/system/asset/site/batch-delete`, { ids: selectedIds.value })
    if (res && res.success) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchSites()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '批量删除失败')
  }
}

const handleFormSubmit = async (formData: any) => {
  try {
    const isEdit = !!formData.id
    if (isEdit) {
      await request.put(`/api/v1/system/asset/site/${formData.id}`, formData)
      ElMessage.success('更新成功')
    } else {
      await request.post('/api/v1/system/asset/site', formData)
      ElMessage.success('新增成功')
    }
    fetchSites()
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
        site_code: item['站点编码'],
        site_name: item['站点名称'],
        site_type: item['站点类型(1/2/3/4)'] || 1,
        zone_code: item['挂载分区编码'] || null,
        address: item['详细地址'],
        lng: item['经度'],
        lat: item['纬度'],
        crs: item['坐标系'] || 'CGCS2000'
      }
      await request.post('/api/v1/system/asset/site', payload)
      successCount++
    } catch (e) {
      failCount++
    }
  }
  loading.value = false
  ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`)
  fetchSites()
}

const handleExport = () => {
  if (!tableData.value || !tableData.value.length) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  const typeMap: Record<number, string> = { 1: '水厂', 2: '加压泵站', 3: '二供泵房', 4: '管网监测点' }
  const exportData = tableData.value.map((item: any) => ({
    ...item,
    site_type_name: typeMap[item.site_type] || item.site_type
  }))
  const headers = {
    id: '站点ID',
    site_code: '站点编码',
    site_name: '站点名称',
    site_type_name: '站点类型',
    zone_name: '所属分区',
    address: '详细地址',
    lng: '经度',
    lat: '纬度',
    crs: '坐标系'
  }
  exportToExcel(exportData, '物理站点台账', headers)
  ElMessage.success('导出成功')
}

onMounted(() => {
  fetchSites()
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