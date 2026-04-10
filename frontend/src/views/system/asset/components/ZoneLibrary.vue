<template>
  <div class="library-container">
    <div class="header">
      <h3>DMA分区台账库</h3>
      <p>管理全局 DMA 分区数据，支持管网层级结构与水量计算节点。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">新增分区</el-button>
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索分区名称" 
        style="width: 240px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchZones"
        @clear="fetchZones"
      />
      <el-button @click="fetchZones" style="margin-left: 12px">搜索</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%; margin-top: 16px" height="60vh">
      <el-table-column prop="id" label="分区ID" width="100" />
      <el-table-column prop="zone_name" label="分区名称" />
      <el-table-column prop="level" label="分区层级">
        <template #default="scope">
          <el-tag v-if="scope.row.level === 1">一级分区</el-tag>
          <el-tag v-else-if="scope.row.level === 2" type="success">二级分区</el-tag>
          <el-tag v-else-if="scope.row.level === 3" type="warning">三级分区</el-tag>
          <span v-else>{{ scope.row.level }}级分区</span>
        </template>
      </el-table-column>
      <el-table-column prop="parent_name" label="上级分区">
        <template #default="scope">
          {{ scope.row.parent_name || '无 (顶层)' }}
        </template>
      </el-table-column>
      <el-table-column prop="mnf_baseline" label="夜间最小流量基线 (m³/h)" width="200" />
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
        @size-change="fetchZones"
        @current-change="fetchZones"
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

onMounted(() => {
  fetchZones()
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
