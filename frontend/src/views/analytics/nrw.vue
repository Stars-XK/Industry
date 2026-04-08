<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>DMA 产销差与漏损分析 (NRW Sankey Analysis)</span>
          <el-select v-model="month" placeholder="请选择分析月份" @change="fetchData" style="width: 150px">
            <el-option label="2026-04" value="2026-04" />
            <el-option label="2026-03" value="2026-03" />
          </el-select>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="10">
          <el-table :data="tableData" style="width: 100%" v-loading="loading" @row-click="handleRowClick" highlight-current-row height="500">
            <el-table-column prop="zone_name" label="DMA分区名称" />
            <el-table-column prop="nrw_ratio" label="产销差率 (NRW %)">
              <template #default="scope">
                <el-progress 
                  :percentage="Number(scope.row.nrw_ratio)" 
                  :color="customColors" 
                  :stroke-width="12" />
              </template>
            </el-table-column>
            <el-table-column prop="nrw_m3" label="漏水损失 (m³)">
              <template #default="scope">
                <span style="color: #E6A23C; font-weight: bold;">
                  {{ Number(scope.row.nrw_m3).toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        
        <el-col :span="14">
          <div class="chart-container" v-loading="sankeyLoading">
            <div class="chart-title">区域水量平衡图 (IWA 标准) - {{ currentZoneName }}</div>
            <div ref="sankeyChartRef" class="sankey-chart"></div>
          </div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <div class="chart-container" v-loading="trendLoading" style="height: 350px;">
            <div class="chart-title">产销差率 (NRW %) 历史趋势及同环比分析</div>
            <div ref="trendChartRef" class="trend-chart"></div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import request from '@/utils/request'
import * as echarts from 'echarts/core'
import { SankeyChart, LineChart, BarChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([SankeyChart, LineChart, BarChart, TooltipComponent, TitleComponent, GridComponent, LegendComponent, CanvasRenderer])

const tableData = ref([])
const loading = ref(false)
const sankeyLoading = ref(false)
const trendLoading = ref(false)
const month = ref('2026-03')
const currentZoneName = ref('')

const sankeyChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let sankeyInstance: echarts.ECharts | null = null
let trendInstance: echarts.ECharts | null = null

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
    if (tableData.value.length > 0) {
      handleRowClick(tableData.value[0])
    } else {
      renderSankey([], [])
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleRowClick = async (row: any) => {
  currentZoneName.value = row.zone_name
  sankeyLoading.value = true
  trendLoading.value = true
  try {
    // 1. 渲染桑基图
    const sankeyRes = await request.get('/api/data-center/analysis/nrw/sankey', { 
      params: { month: row.report_month, zoneId: row.zone_id } 
    })
    if (sankeyRes && sankeyRes.nodes) {
      renderSankey(sankeyRes.nodes, sankeyRes.links)
    }

    // 2. 渲染同环比折线图
    const trendRes: any = await request.get('/api/data-center/analysis/nrw/trend', {
      params: { zoneId: row.zone_id }
    })
    if (trendRes && trendRes.months) {
      renderTrend(trendRes.months, trendRes.ratios)
    }
  } catch (error) {
    console.error(error)
  } finally {
    sankeyLoading.value = false
    trendLoading.value = false
  }
}

const renderSankey = (nodes: any[], links: any[]) => {
  if (!sankeyInstance && sankeyChartRef.value) {
    sankeyInstance = echarts.init(sankeyChartRef.value)
  }
  if (!sankeyInstance) return

  const option = {
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [
      {
        type: 'sankey',
        data: nodes,
        links: links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'gradient', curveness: 0.5 },
        label: {
          position: 'right',
          formatter: '{b} \n ({c} m³)'
        }
      }
    ]
  }
  sankeyInstance.setOption(option)
}

const renderTrend = (months: string[], ratios: number[]) => {
  if (!trendInstance && trendChartRef.value) {
    trendInstance = echarts.init(trendChartRef.value)
  }
  if (!trendInstance) return

  const option = {
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 产销差率: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false },
    yAxis: { type: 'value', name: 'NRW (%)', axisLabel: { formatter: '{value} %' } },
    series: [
      {
        name: '产销差率',
        type: 'line',
        data: ratios,
        smooth: true,
        itemStyle: { color: '#E6A23C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230,162,60,0.5)' },
            { offset: 1, color: 'rgba(230,162,60,0.1)' }
          ])
        }
      }
    ]
  }
  trendInstance.setOption(option)
}

const handleResize = () => {
  if (sankeyInstance) sankeyInstance.resize()
  if (trendInstance) trendInstance.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (sankeyInstance) sankeyInstance.dispose()
  if (trendInstance) trendInstance.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
.chart-container {
  height: 500px;
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
.sankey-chart {
  width: 100%;
  height: 450px;
}
.trend-chart {
  width: 100%;
  height: 300px;
}
</style>
