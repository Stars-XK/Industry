<template>
  <div class="library-container">
    <div class="header">
      <h3>测点数据字典库</h3>
      <p>统一管理系统中的时序数据点位映射规则。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">新增测点定义</el-button>
      <el-input 
        v-model="queryParams.keyword" 
        placeholder="搜索测点编码或名称" 
        style="width: 240px; margin-left: 12px" 
        prefix-icon="Search" 
        clearable
        @keyup.enter="fetchPoints"
        @clear="fetchPoints"
      />
      <el-button @click="fetchPoints" style="margin-left: 12px">搜索</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%; margin-top: 16px" height="60vh">
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
      <el-table-column label="操作" width="150" align="center">
        <template #default>
          <el-button link type="primary">修改映射</el-button>
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
        @size-change="fetchPoints"
        @current-change="fetchPoints"
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

onMounted(() => {
  fetchPoints()
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