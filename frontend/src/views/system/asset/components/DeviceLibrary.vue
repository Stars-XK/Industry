<template>
  <div class="library-container">
    <div class="header">
      <h3>设备资产台账库</h3>
      <p>管理全局物联网设备及仪器仪表资产数据。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">录入新设备</el-button>
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索设备编码或名称" 
        style="width: 240px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchDevices"
        @clear="fetchDevices"
      />
      <el-button @click="fetchDevices" style="margin-left: 12px">搜索</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%; margin-top: 16px" height="60vh">
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
      <el-table-column label="操作" width="150" align="center">
        <template #default>
          <el-button link type="primary">编辑</el-button>
          <el-button link type="danger">报废</el-button>
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