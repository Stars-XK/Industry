<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">DMA 产销差与漏损分析</h1>
        <p class="page-subtitle">NRW Sankey Analysis & Leakage Reports</p>
      </div>
      <div class="header-actions">
        <el-select v-model="month" placeholder="分析月份" @change="fetchData" class="glass-select" style="width: 160px">
          <el-option label="2026-04" value="2026-04" />
          <el-option label="2026-03" value="2026-03" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="24" style="margin-bottom: 24px;">
      <el-col :span="10">
        <div class="glass-panel hover-lift table-panel" v-loading="loading" element-loading-background="rgba(15,23,42,0.8)">
          <div class="panel-header">
            <div class="panel-title">分区漏损排行 <span>Zone Ranking</span></div>
          </div>
          <el-table :data="tableData" style="width: 100%" @row-click="handleRowClick" highlight-current-row height="440" class="dark-table custom-scrollbar">
            <el-table-column prop="zone_name" label="DMA分区" min-width="120" />
            <el-table-column prop="nrw_ratio" label="产销差率 (%)" min-width="150">
              <template #default="scope">
                <el-progress 
                  :percentage="Number(scope.row.nrw_ratio)" 
                  :color="customColors" 
                  :stroke-width="8" 
                  :show-text="true"
                  class="dark-progress" />
              </template>
            </el-table-column>
            <el-table-column prop="nrw_m3" label="损失量 (m³)" align="right" min-width="120">
              <template #default="scope">
                <span class="highlight-number">
                  {{ Number(scope.row.nrw_m3).toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      
      <el-col :span="14">
        <div class="glass-panel hover-lift chart-panel" v-loading="sankeyLoading" element-loading-background="rgba(15,23,42,0.8)">
          <div class="panel-header">
            <div class="panel-title">水量平衡图 (IWA) <span>Sankey Diagram</span></div>
            <el-tag type="info" effect="dark" class="dark-tag">{{ currentZoneName || '未选择' }}</el-tag>
          </div>
          <div ref="sankeyChartRef" class="sankey-chart"></div>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="glass-panel hover-lift chart-panel" v-loading="trendLoading" element-loading-background="rgba(15,23,42,0.8)" style="height: 380px;">
          <div class="panel-header">
            <div class="panel-title">历史趋势及同环比分析 <span>Historical Trend</span></div>
          </div>
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>
      </el-col>
    </el-row>
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
    tooltip: { trigger: 'item', triggerOn: 'mousemove', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e2e8f0' } },
    series: [
      {
        type: 'sankey',
        data: nodes,
        links: links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'gradient', curveness: 0.5 },
        label: {
          position: 'right',
          formatter: '{b} \n ({c} m³)',
          color: '#e2e8f0',
          fontFamily: 'SF Pro Display'
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)'
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
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 产销差率: {c}%', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e2e8f0' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: { type: 'value', name: 'NRW (%)', nameTextStyle: { color: '#64748b' }, axisLabel: { formatter: '{value} %', color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } } },
    series: [
      {
        name: '产销差率',
        type: 'line',
        data: ratios,
        smooth: true,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3, shadowColor: 'rgba(245,158,11,0.5)', shadowBlur: 10 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,158,11,0.5)' },
            { offset: 1, color: 'rgba(245,158,11,0.05)' }
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
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}
.table-panel {
  height: 520px;
  padding: 20px;
}
.chart-panel {
  height: 520px;
  padding: 20px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-title span {
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.dark-tag {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
}
.sankey-chart, .trend-chart {
  width: 100%;
  flex: 1;
}
.highlight-number {
  color: #f59e0b;
  font-weight: 700;
  font-family: "SF Mono", monospace;
  font-size: 16px;
}
:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}
:deep(.el-table tr) {
  background-color: transparent !important;
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid var(--el-table-border-color);
}
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: var(--el-table-row-hover-bg-color) !important;
}
:deep(.el-table__body tr.current-row > td.el-table__cell) {
  background-color: var(--el-table-current-row-bg-color) !important;
}
:deep(.el-table::before) {
  display: none;
}
.custom-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
}
:deep(.dark-progress .el-progress__text) {
  color: #e2e8f0;
  font-family: "SF Mono", monospace;
}
:deep(.dark-progress .el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1);
}
:deep(.glass-select .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-select .el-input__inner) {
  color: #e2e8f0;
}
</style>
