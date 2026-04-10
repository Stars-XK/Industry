<template>
  <div class="app-container wide-panel fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">DMA 产销差与漏损报表</h1>
        <p class="page-subtitle">基于水平衡分析与管网拓扑的精细化水量追踪</p>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="reportType" style="margin-right: 12px" @change="fetchData">
          <el-radio-button label="daily">产销差日报</el-radio-button>
          <el-radio-button label="monthly">产销差月报</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="reportType === 'daily'"
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
        />
        <el-date-picker
          v-else
          v-model="monthRange"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          style="width: 280px"
        />
        <el-select v-model="topoVersion" placeholder="选择拓扑版本" style="width: 160px; margin-left: 12px">
          <el-option label="当前最新拓扑 (v2.4)" value="latest" />
          <el-option label="2025年上本年拓扑 (v2.3)" value="v2.3" />
          <el-option label="2024年下半年拓扑 (v2.2)" value="v2.2" />
        </el-select>
        <el-button type="primary" @click="fetchData" >
          <el-icon style="margin-right: 4px"><Search /></el-icon> 分析查询
        </el-button>
        <el-button type="success" @click="exportReport" >
          <el-icon style="margin-right: 4px"><Download /></el-icon> 导出报表
        </el-button>
      </div>
    </div>
    <el-row :gutter="24" style="margin-bottom: 24px; flex-wrap: wrap;">
      <el-col :xs="24" :lg="12" :xl="12">
        <div class="box-card" v-loading="loading" style="min-height: 500px; margin-bottom: 24px;" >
          <div class="panel-header">
            <div class="panel-title">分区漏损排行 <span>Zone Ranking</span></div>
          </div>
          <el-table :data="tableData" row-key="zone_id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" style="width: 100%" @row-click="handleRowClick" highlight-current-row height="440" class="custom-table custom-scrollbar" default-expand-all>
            <el-table-column prop="zone_name" label="DMA分区"  show-overflow-tooltip min-width="140" />
            <el-table-column prop="supply_m3" label="供水量(m³)" align="right" min-width="100">
              <template #default="scope">
                {{ Number(scope.row.supply_m3).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="sale_m3" label="售水量(m³)" align="right" min-width="100">
              <template #default="scope">
                {{ Number(scope.row.sale_m3).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="nrw_ratio" label="产销差率 (%)" min-width="130" show-overflow-tooltip>
              <template #default="scope">
                <el-progress 
                  :percentage="Number(scope.row.nrw_ratio) || 0" 
                  :color="customColors" 
                  :stroke-width="8" 
                  :show-text="true"
                  class="dark-progress" />
              </template>
            </el-table-column>
            <el-table-column prop="nrw_m3" label="损失量 (m³)" align="right" show-overflow-tooltip min-width="110">
              <template #default="scope">
                <span class="highlight-number">
                  {{ Number(scope.row.nrw_m3).toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12" :xl="12">
        <div class="box-card" v-loading="sankeyLoading" style="min-height: 500px; margin-bottom: 24px;" >
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
import { ElMessage } from 'element-plus'
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
const reportType = ref('monthly')
const dateRange = ref<[Date, Date]>([new Date(), new Date()])
const monthRange = ref<[Date, Date]>([new Date(), new Date()])
const topoVersion = ref('latest')
const currentZoneName = ref('')
const sankeyChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let sankeyInstance: echarts.ECharts | null = null
let trendInstance: echarts.ECharts | null = null
const customColors = [
  { color: '#10b981', percentage: 10 },
  { color: '#f59e0b', percentage: 15 },
  { color: '#ef4444', percentage: 20 },
]
const exportReport = () => {
  // dummy export
}
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟请求
    await new Promise(r => setTimeout(r, 600))
    // 模拟全部分区树形数据
    tableData.value = [
      {
        zone_id: '101', zone_name: '泉州市供水总管网', nrw_ratio: 14.5, nrw_m3: 154000, supply_m3: 1062000, sale_m3: 908000,
        children: [
          {
            zone_id: '102', zone_name: '丰泽区分公司', nrw_ratio: 15.2, nrw_m3: 90000, supply_m3: 592000, sale_m3: 502000,
            children: [
              { zone_id: '201', zone_name: '东海科技园区', nrw_ratio: 12.0, nrw_m3: 14000, supply_m3: 116000, sale_m3: 102000 },
              { zone_id: '202', zone_name: '泉港新片区', nrw_ratio: 8.9, nrw_m3: 17000, supply_m3: 191000, sale_m3: 174000 },
              { zone_id: '203', zone_name: '浦西金融区', nrw_ratio: 18.5, nrw_m3: 59000, supply_m3: 318000, sale_m3: 259000 }
            ]
          },
          {
            zone_id: '104', zone_name: '鲤城区分公司', nrw_ratio: 11.7, nrw_m3: 64000, supply_m3: 547000, sale_m3: 483000,
            children: [
              { zone_id: '204', zone_name: '洛江开发区', nrw_ratio: 11.7, nrw_m3: 64000, supply_m3: 547000, sale_m3: 483000 }
            ]
          }
        ]
      }
    ] as any
    
    if (tableData.value.length > 0) {
      handleRowClick(tableData.value[0])
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
    await new Promise(r => setTimeout(r, 400))
    // Mock 桑基图数据 (展示水量平衡)
    const baseSupply = Number(row.supply_m3) || (100000 + Math.floor(Math.random() * 50000))
    const baseSale = Number(row.sale_m3) || (baseSupply * 0.8)
    const nrw = baseSupply - baseSale
    const nodes = [
      { name: '总供水量' },
      { name: '总售水量' },
      { name: '未计费水量' },
      { name: '表观漏损(误差/偷水)' },
      { name: '真实漏损(物理漏水)' },
      { name: '产销差水量' }
    ]
    const links = [
      { source: '总供水量', target: '总售水量', value: baseSale },
      { source: '总供水量', target: '产销差水量', value: nrw },
      { source: '产销差水量', target: '未计费水量', value: nrw * 0.25 },
      { source: '产销差水量', target: '表观漏损(误差/偷水)', value: nrw * 0.25 },
      { source: '产销差水量', target: '真实漏损(物理漏水)', value: nrw * 0.5 }
    ]
    renderSankey(nodes, links)
    
    // Mock 同环比折线图数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const ratios = Array.from({ length: 6 }, () => 10 + Math.floor(Math.random() * 8))
    renderTrend(months, ratios)
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
    tooltip: { trigger: 'item', triggerOn: 'mousemove', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e4e7ed', textStyle: { color: '#303133' } },
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
          color: '#303133',
          fontFamily: 'SF Pro Display'
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#c0c4cc'
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
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 产销差率: {c}%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e4e7ed', textStyle: { color: '#303133' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: months, boundaryGap: false, axisLabel: { color: '#606266' }, axisLine: { lineStyle: { color: '#c0c4cc' } } },
    yAxis: { type: 'value', name: 'NRW (%)', nameTextStyle: { color: '#606266' }, axisLabel: { formatter: '{value} %', color: '#606266' }, splitLine: { lineStyle: { color: '#e4e7ed', type: 'dashed' } } },
    series: [
      {
        name: '产销差率',
        type: 'line',
        data: ratios,
        smooth: true,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3, shadowColor: 'rgba(230, 162, 60, 0.5)', shadowBlur: 10 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.5)' },
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
