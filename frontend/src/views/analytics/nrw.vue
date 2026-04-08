<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>DMA 产销差与漏损分析 (NRW)</span>
          <el-select v-model="month" placeholder="请选择分析月份" @change="fetchData" style="width: 150px">
            <el-option label="2026-04" value="2026-04" />
            <el-option label="2026-03" value="2026-03" />
            <el-option label="所有月份" value="" />
          </el-select>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="zone_name" label="DMA分区名称" width="200" />
        <el-table-column prop="report_month" label="统计月份" width="120" />
        <el-table-column prop="supply_m3" label="系统供水量 (m³)" width="180">
          <template #default="scope">{{ Number(scope.row.supply_m3).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="consumption_m3" label="合法计费水量 (m³)" width="180">
          <template #default="scope">{{ Number(scope.row.consumption_m3).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="nrw_m3" label="产销差水量 (m³)" width="180">
          <template #default="scope">
            <span style="color: #E6A23C; font-weight: bold;">
              {{ Number(scope.row.nrw_m3).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="nrw_ratio" label="产销差率 (NRW %)">
          <template #default="scope">
            <el-progress 
              :percentage="Number(scope.row.nrw_ratio)" 
              :color="customColors" 
              :stroke-width="12" />
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
const month = ref('')

const customColors = [
  { color: '#67C23A', percentage: 10 },
  { color: '#E6A23C', percentage: 15 },
  { color: '#F56C6C', percentage: 20 },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/analysis/nrw', { params: { month: month.value } })
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
