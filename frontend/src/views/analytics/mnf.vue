<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>夜间最小流量分析 (MNF Baseline)</span>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="analysis_date" label="分析日期" width="150" />
        <el-table-column prop="zone_name" label="DMA分区名称" width="200" />
        <el-table-column prop="mnf_value" label="MNF 实际观测值 (m³/h)" width="200">
          <template #default="scope">
            <span :style="{ color: scope.row.status === 'anomaly' ? '#f56c6c' : '#606266', fontWeight: 'bold' }">
              {{ scope.row.mnf_value }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="baseline_value" label="AI 基线预期值 (m³/h)" width="200">
          <template #default="scope">
            <span style="color: #67c23a;">{{ scope.row.baseline_value }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="anomaly_score" label="异常偏离分数" width="150" />
        <el-table-column prop="status" label="分析状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'" effect="dark">
              {{ scope.row.status === 'normal' ? '健康 (无物理漏水)' : '异常 (疑似暗漏)' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const tableData = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/analysis/mnf')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
