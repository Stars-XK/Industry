<template>
  <div class="library-container">
    <div class="header">
      <h3>物理站点台账库</h3>
      <p>管理全局物理站点数据（水厂、泵房、管网等）。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">注册新站点</el-button>
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索站点编码或名称" 
        style="width: 240px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchSites"
        @clear="fetchSites"
      />
      <el-button @click="fetchSites" style="margin-left: 12px">搜索</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%; margin-top: 16px" height="75vh">
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
      <el-table-column prop="zone_name" label="当前挂载分区">
        <template #default="scope">
          {{ scope.row.zone_name || '未挂载' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default>
          <el-button link type="primary">编辑</el-button>
          <el-button link type="danger">删除</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
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

onMounted(() => {
  fetchSites()
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