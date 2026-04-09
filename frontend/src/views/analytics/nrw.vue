<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">DMA 产销差与漏损报表</h1>
        <p class="page-subtitle">基于水平衡分析与管网拓扑的精细化水量追踪</p>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
        />
        <el-select v-model="topoVersion" placeholder="选择拓扑版本" style="width: 160px; margin-left: 12px">
          <el-option label="当前最新拓扑 (v2.4)" value="latest" />
          <el-option label="2025年上本年拓扑 (v2.3)" value="v2.3" />
          <el-option label="2024年下半年拓扑 (v2.2)" value="v2.2" />
        </el-select>
        <el-button type="primary" @click="fetchData" style="margin-left: 12px">
          <el-icon style="margin-right: 4px"><Search /></el-icon> 分析查询
        </el-button>
        <el-button type="success" @click="exportReport" style="margin-left: 12px">
          <el-icon style="margin-right: 4px"><Download /></el-icon> 导出报表
        </el-button>
      </div>
    </div>
    <el-row :gutter="24" style="margin-bottom: 24px;">
      <el-col :span="10">
        <div class="box-card" v-loading="loading" >
          <div class="panel-header">
            <div class="panel-title">分区漏损排行 <span>Zone Ranking</span></div>
          </div>
          <el-table :data="tableData" style="width: 100%" @row-click="handleRowClick" highlight-current-row height="440" class="custom-table custom-scrollbar">
            <el-table-column prop="zone_name" label="DMA分区" min-width="120" />
            <el-table-column prop="nrw_ratio" label="产销差率 (%)" min-width="150">
              <template #default="scope">
                <el-progress 
                  :percentage="Number(scope.row.nrw_ratio) || 0" 
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
        <div class="box-card" v-loading="sankeyLoading" >
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
        <div class="box-card" v-loading="trendLoading"  style="height: 380px;">
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
import { Search, Download } from '@element-plus/icons-vue'
echarts.use([SankeyChart, LineChart, BarChart, TooltipComponent, TitleComponent, GridComponent, LegendComponent, CanvasRenderer])
const tableData = ref([])
const loading = ref(false)
const sankeyLoading = ref(false)
const trendLoading = ref(false)
const dateRange = ref<[Date, Date]>([new Date(), new Date()])
const topoVersion = ref('latest')
const currentZoneName = ref('')
const sankeyChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let sankeyInstance: echarts.ECharts | null = null
let trendInstance: echarts.ECharts | null = null
const customColors = [
  { color: 'var(--el-color-success)', percentage: 10 },
  { color: 'var(--el-color-warning)', percentage: 15 },
  { color: 'var(--el-color-danger)', percentage: 20 },
]
const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/data-center/analytics/nrw', { params: { month: month.value } })
    tableData.value = res || []
    if (tableData.value.length > 0) {
      handleRowClick(tableData.value[0])
    } else {
      renderSankey([], [])
    }
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const handleRowClick = async (row: any) => {
  currentZoneName.value = row.zone_name
  sankeyLoading.value = true
  trendLoading.value = true
  try {
    // 1. 渲染桑基图
    const sankeyRes: any = await request.get('/api/v1/data-center/analytics/nrw/sankey', {
      params: { month: row.report_month, zoneId: row.zone_id }
    })
    if (sankeyRes && sankeyRes.nodes) {
      renderSankey(sankeyRes.nodes, sankeyRes.links)
    }
    // 2. 渲染同环比折线图
    const trendRes: any = await request.get('/api/v1/data-center/analytics/nrw/trend', {
      params: { zoneId: row.zone_id }
    })
    if (trendRes && trendRes.months) {
      renderTrend(trendRes.months, trendRes.ratios)
    }
  } catch (e) { /* fallback */ } finally {
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
    tooltip: { trigger: 'item', triggerOn: 'mousemove', backgroundColor: 'var(--el-bg-color-overlay)', borderColor: 'var(--el-border-color-light)', textStyle: { color: 'var(--el-text-color-primary)' } },
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
          color: 'var(--el-text-color-primary)',
          fontFamily: 'SF Pro Display'
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: 'var(--el-border-color-darker)'
        }
      }
    ]
  }
  sankeyInstance.setOption(option)
  // 下钻功能
  sankeyInstance.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data.name.includes('分区')) {
      // @ts-ignore
      ElMessage.info(`正在下钻到: ${params.data.name}`);
      // 模拟下钻数据刷新
      currentZoneName.value = params.data.name;
      renderSankey([], []);
    }
  });
}
const renderTrend = (months: string[], ratios: number[]) => {
  if (!trendInstance && trendChartRef.value) {
    trendInstance = echarts.init(trendChartRef.value)
  }
  if (!trendInstance) return
  const option = {
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 产销差率: {c}%', backgroundColor: 'var(--el-bg-color-overlay)', borderColor: 'var(--el-border-color-light)', textStyle: { color: 'var(--el-text-color-primary)' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false, axisLabel: { color: 'var(--el-text-color-regular)' }, axisLine: { lineStyle: { color: 'var(--el-border-color-darker)' } } },
    yAxis: { type: 'value', name: 'NRW (%)', nameTextStyle: { color: 'var(--el-text-color-regular)' }, axisLabel: { formatter: '{value} %', color: 'var(--el-text-color-regular)' }, splitLine: { lineStyle: { color: 'var(--el-border-color-light)', type: 'dashed' } } },
    series: [
      {
        name: '产销差率',
        type: 'line',
        data: ratios,
        smooth: true,
        itemStyle: { color: 'var(--el-color-warning)' },
        lineStyle: { width: 3, shadowColor: 'var(--el-color-warning-light-5)', shadowBlur: 10 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'var(--el-color-warning-light-5)' },
            { offset: 1, color: 'transparent' }
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
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  flex: 1;
  }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin: 0;
  letter-spacing: 0.5px;
}

.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}

.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title span {
  font-size: 13px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sankey-chart, .trend-chart {
  width: 100%;
  flex: 1;
  min-height: 300px;
}

.highlight-number {
  color: var(--el-color-warning);
  font-weight: 600;
  font-family: "SF Mono", Consolas, monospace;
  font-size: 16px;
}

.custom-table {
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-primary);
  background: var(--el-fill-color-blank);
}
</style>
