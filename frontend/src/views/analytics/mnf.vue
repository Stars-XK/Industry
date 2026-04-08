<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>夜间最小流量 AI 基线分析 (MNF Scatter Analysis)</span>
          <el-button type="warning" plain @click="handleDeductKeyAccount">
            剥离大户夜间合法水量
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="16">
          <div class="chart-container" v-loading="chartLoading">
            <div class="chart-title">张江高科技园区 DMA - MNF 散点图与预测基线 (02:00-04:00)</div>
            <div ref="scatterChartRef" class="scatter-chart"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <el-table :data="tableData" style="width: 100%" v-loading="loading" height="480">
            <el-table-column prop="analysis_date" label="分析日期" width="110" />
            <el-table-column prop="mnf_value" label="MNF (m³/h)">
              <template #default="scope">
                <span :style="{ color: scope.row.status === 'anomaly' ? '#f56c6c' : '#606266', fontWeight: 'bold' }">
                  {{ scope.row.mnf_value }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="分析状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'" effect="dark" size="small">
                  {{ scope.row.status === 'normal' ? '健康' : '疑似暗漏' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import * as echarts from 'echarts/core'
import { ScatterChart, LineChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent, GridComponent, LegendComponent, MarkPointComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([ScatterChart, LineChart, TooltipComponent, TitleComponent, GridComponent, LegendComponent, MarkPointComponent, CanvasRenderer])

const tableData = ref([])
const loading = ref(false)
const chartLoading = ref(false)

const scatterChartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const fetchData = async () => {
  loading.value = true
  chartLoading.value = true
  try {
    const res = await request.get('/api/data-center/analysis/mnf')
    tableData.value = res || []
    
    const chartRes = await request.get('/api/data-center/analysis/mnf/scatter')
    if (chartRes) {
      renderScatter(chartRes)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    chartLoading.value = false
  }
}

const renderScatter = (data: any) => {
  if (!chartInstance && scatterChartRef.value) {
    chartInstance = echarts.init(scatterChartRef.value)
  }
  if (!chartInstance) return

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['AI 基线预测', '实际散点'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.dates, boundaryGap: false },
    yAxis: { type: 'value', name: '流量 (m³/h)' },
    series: [
      {
        name: 'AI 基线预测',
        type: 'line',
        data: data.baselineLine,
        smooth: true,
        lineStyle: { color: '#67c23a', width: 2 },
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '实际散点',
        type: 'scatter',
        data: data.actualPoints,
        itemStyle: { color: '#409eff' },
        markPoint: {
          data: data.anomalies,
          itemStyle: { color: '#f56c6c' },
          label: { formatter: '{c}' }
        }
      }
    ]
  }
  chartInstance.setOption(option)
}

const handleDeductKeyAccount = async () => {
  try {
    const res = await request.post('/api/data-center/analysis/mnf/deduct', { zoneId: '201', deductValue: 4.5 })
    ElMessage.success(`已自动剥离 [张江微电子制造中心] 凌晨时段合法工艺用水 4.5 m³/h，${res.message || '重算完成'}`)
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

const handleResize = () => {
  if (chartInstance) chartInstance.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.chart-container {
  height: 480px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}
.chart-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}
.scatter-chart {
  width: 100%;
  height: 420px;
}
</style>
