<template>
  <div class="app-container fade-in-up scada-overview">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">全局态势感知</h1>
        <p class="page-subtitle">Real-time Global Operations Dashboard</p>
      </div>
      <div class="header-actions">
        <el-tag effect="dark" class="status-tag pulse-tag">系统运行正常</el-tag>
      </div>
    </div>
    <!-- 核心 KPI 概览 -->
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in metrics" :key="index" style="margin-bottom: 24px;">
        <div class="box-card kpi-card">
          <div class="metric-icon-wrap" :style="{ color: item.color, boxShadow: `0 0 20px ${item.color}30` }">
            <el-icon class="metric-icon"><component :is="item.icon" /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-title">{{ item.title }}</div>
            <div class="metric-value">
              {{ item.value }}
              <span class="metric-unit" v-if="item.unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 水质综合看板与能耗趋势 -->
    <el-row :gutter="24">
      <el-col :xs="24" :lg="12" style="margin-bottom: 24px;">
        <div class="box-card">
          <div class="panel-header">
            <div class="panel-title">水质综合看板 <span>Water Quality</span></div>
            <div class="panel-extra">
              <span class="highlight-text">达标率: {{ complianceRate }}%</span>
            </div>
          </div>
          <div class="chart-container" v-loading="loading" >
            <v-chart class="chart" :option="waterQualityOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12" style="margin-bottom: 24px;">
        <div class="box-card">
          <div class="panel-header">
            <div class="panel-title">能耗折标煤趋势 <span>Energy Trend</span></div>
            <el-radio-group v-model="energyTrendRange" size="small" class="custom-radio" @change="fetchEnergyTrend">
              <el-radio-button value="7days">7天</el-radio-button>
              <el-radio-button value="30days">30天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container" v-loading="loading" >
            <v-chart class="chart" :option="energyTrendOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 供水漏损趋势与报警列表 -->
    <el-row :gutter="24">
      <el-col :xs="24" :lg="16" style="margin-bottom: 24px;">
        <div class="box-card">
          <div class="panel-header">
            <div class="panel-title">供水与漏损趋势 <span>Supply & Leakage</span></div>
            <el-tag type="info" effect="dark" class="dark-tag">1h 聚合</el-tag>
          </div>
          <div class="chart-container" v-loading="loading" >
            <v-chart class="chart" :option="trendOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8" style="margin-bottom: 24px;">
        <div class="box-card">
          <div class="panel-header">
            <div class="panel-title">活跃异常报警 <span>Active Alarms</span></div>
            <el-button link >处理</el-button>
          </div>
          <div class="alarm-list custom-scrollbar">
            <el-empty v-if="!metrics[3] || metrics[3].value === 0" description="运行正常" :image-size="60" />
            <el-timeline v-else class="dark-timeline">
              <el-timeline-item
                v-for="(activity, index) in alarms"
                :key="index"
                :type="activity.type"
                :color="activity.color || 'var(--el-color-primary)'"
                :size="activity.size || 'large'"
                :timestamp="activity.timestamp"
                placement="top"
              >
                <div class="timeline-content">{{ activity.content }}</div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { DataLine, WarnTriangleFilled, Opportunity, Odometer } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, GaugeChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent } from 'echarts/components'
import VChart from 'vue-echarts'
use([CanvasRenderer, LineChart, BarChart, GaugeChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent])
const loading = ref(false)
const energyTrendRange = ref('7days')
const complianceRate = ref(99.8)
const metrics = ref([
  { title: '今日总供水量', value: 0, unit: 'm³', icon: markRaw(Odometer), color: '#409EFF' },
  { title: '今日总漏水量', value: 0, unit: 'm³', icon: markRaw(Opportunity), color: 'var(--el-color-warning)' },
  { title: '实时产销差率', value: 0, unit: '%', icon: markRaw(DataLine), color: 'var(--el-color-success)' },
  { title: '活跃异常报警', value: 0, unit: '条', icon: markRaw(WarnTriangleFilled), color: 'var(--el-color-danger)' },
])
const trendOption = ref({
  tooltip: { trigger: 'axis', backgroundColor: 'var(--el-bg-color-overlay)', borderColor: 'var(--el-border-color-light)', textStyle: { color: 'var(--el-text-color-primary)' } },
  legend: { data: ['供水量 (m³/h)', '漏水量 (m³/h)'], textStyle: { color: 'var(--el-text-color-regular)' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [], axisLabel: { color: 'var(--el-text-color-regular)' }, axisLine: { lineStyle: { color: 'var(--el-border-color-darker)' } } },
  yAxis: { type: 'value', axisLabel: { color: 'var(--el-text-color-regular)' }, splitLine: { lineStyle: { color: 'var(--el-border-color-light)', type: 'dashed' } } },
  series: [
    {
      name: '供水量 (m³/h)',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: { color: 'var(--el-color-primary)' },
      lineStyle: { width: 3, shadowColor: 'var(--el-color-primary-light-5)', shadowBlur: 10 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'var(--el-color-primary-light-5)' }, { offset: 1, color: 'transparent' }]
        }
      }
    },
    {
      name: '漏水量 (m³/h)',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: { color: 'var(--el-color-warning)' },
      lineStyle: { width: 3, shadowColor: 'var(--el-color-warning-light-5)', shadowBlur: 10 }
    }
  ]
})
const waterQualityOption = ref({
  tooltip: { formatter: '{a} <br/>{b} : {c}', backgroundColor: 'var(--el-bg-color-overlay)', textStyle: { color: 'var(--el-text-color-primary)' }, borderColor: 'var(--el-border-color-light)' },
  series: [
    {
      name: '浊度 (NTU)',
      type: 'gauge',
      center: ['20%', '50%'],
      radius: '75%',
      min: 0,
      max: 5,
      axisLine: { lineStyle: { width: 10, color: [[0.2, 'var(--el-color-success)'], [0.8, 'var(--el-color-warning)'], [1, 'var(--el-color-danger)']] } },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -10, length: 4, lineStyle: { color: 'var(--el-bg-color)', width: 1 } },
      splitLine: { distance: -10, length: 10, lineStyle: { color: 'var(--el-bg-color)', width: 2 } },
      axisLabel: { color: 'var(--el-text-color-regular)', distance: 15, fontSize: 10 },
      detail: { fontSize: 14, formatter: '{value} NTU', color: 'var(--el-text-color-primary)' },
      data: [{ value: 0, name: '浊度' }],
      title: { color: 'var(--el-text-color-regular)', fontSize: 12, offsetCenter: [0, '70%'] }
    },
    {
      name: '余氯 (mg/L)',
      type: 'gauge',
      center: ['50%', '50%'],
      radius: '75%',
      min: 0,
      max: 2,
      axisLine: { lineStyle: { width: 10, color: [[0.15, 'var(--el-color-danger)'], [0.8, 'var(--el-color-success)'], [1, 'var(--el-color-warning)']] } },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -10, length: 4, lineStyle: { color: 'var(--el-bg-color)', width: 1 } },
      splitLine: { distance: -10, length: 10, lineStyle: { color: 'var(--el-bg-color)', width: 2 } },
      axisLabel: { color: 'var(--el-text-color-regular)', distance: 15, fontSize: 10 },
      detail: { fontSize: 14, formatter: '{value} mg/L', color: 'var(--el-text-color-primary)' },
      data: [{ value: 0, name: '余氯' }],
      title: { color: 'var(--el-text-color-regular)', fontSize: 12, offsetCenter: [0, '70%'] }
    },
    {
      name: 'pH值',
      type: 'gauge',
      center: ['80%', '50%'],
      radius: '75%',
      min: 0,
      max: 14,
      axisLine: { lineStyle: { width: 10, color: [[0.45, 'var(--el-color-danger)'], [0.6, 'var(--el-color-success)'], [1, 'var(--el-color-danger)']] } },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -10, length: 4, lineStyle: { color: 'var(--el-bg-color)', width: 1 } },
      splitLine: { distance: -10, length: 10, lineStyle: { color: 'var(--el-bg-color)', width: 2 } },
      axisLabel: { color: 'var(--el-text-color-regular)', distance: 15, fontSize: 10 },
      detail: { fontSize: 14, formatter: '{value}', color: 'var(--el-text-color-primary)' },
      data: [{ value: 0, name: 'pH值' }],
      title: { color: 'var(--el-text-color-regular)', fontSize: 12, offsetCenter: [0, '70%'] }
    }
  ]
})
const energyTrendOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'var(--el-bg-color-overlay)', borderColor: 'var(--el-border-color-light)', textStyle: { color: 'var(--el-text-color-primary)' } },
  legend: { data: ['水耗折标煤', '电耗折标煤', '气耗折标煤'], textStyle: { color: 'var(--el-text-color-regular)' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: [], axisLabel: { color: 'var(--el-text-color-regular)' }, axisLine: { lineStyle: { color: 'var(--el-border-color-darker)' } } },
  yAxis: { type: 'value', name: 'kgce', nameTextStyle: { color: 'var(--el-text-color-regular)' }, axisLabel: { color: 'var(--el-text-color-regular)' }, splitLine: { lineStyle: { color: 'var(--el-border-color-light)', type: 'dashed' } } },
  series: [
    { name: '水耗折标煤', type: 'bar', stack: 'total', data: [], itemStyle: { color: 'var(--el-color-primary)', borderRadius: [0, 0, 0, 0] } },
    { name: '电耗折标煤', type: 'bar', stack: 'total', data: [], itemStyle: { color: 'var(--el-color-success)', borderRadius: [0, 0, 0, 0] } },
    { name: '气耗折标煤', type: 'bar', stack: 'total', data: [], itemStyle: { color: 'var(--el-color-warning)', borderRadius: [4, 4, 0, 0] } }
  ]
})
const alarms = ref<any[]>([])
const fetchAlarms = async () => {
  try {
    const res: any = await request.get('/api/v1/scada/overview/alarms')
    if (res && res.code === 200) {
      alarms.value = res.data || []
    }
  } catch (e) { /* fallback */ 
    alarms.value = [
      { id: 1, time: '10:24:33', level: 'high', message: '[1号厂区] 进水压力低于 0.15MPa' },
      { id: 2, time: '09:12:05', level: 'critical', message: '[加药间] 硫化氢浓度超标联锁' },
      { id: 3, time: '08:05:11', level: 'medium', message: '[二供泵房] 变频器通讯中断' }
    ]
  }
}
const fetchEnergyTrend = async () => {
  try {
    const res: any = await request.get('/api/v1/scada/overview/energy-trend', { params: { range: energyTrendRange.value } })
    if (res && res.code === 200) {
      energyTrendOption.value.xAxis.data = res.data.dates
      energyTrendOption.value.series[0].data = res.data.waterEnergy
      energyTrendOption.value.series[1].data = res.data.elecEnergy
      energyTrendOption.value.series[2].data = res.data.gasEnergy
    }
  } catch (e) { /* fallback */
    energyTrendOption.value.xAxis.data = ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07']
    energyTrendOption.value.series[0].data = [120, 132, 101, 134, 90, 230, 210]
    energyTrendOption.value.series[1].data = [220, 182, 191, 234, 290, 330, 310]
    energyTrendOption.value.series[2].data = [150, 232, 201, 154, 190, 330, 410]
  }
}
const fetchData = async () => {
  loading.value = true
  try {
    const resMetrics: any = await request.get('/api/v1/scada/overview/metrics')
    if (resMetrics && resMetrics.code === 200) {
      metrics.value[0].value = resMetrics.data.dailySupply
      metrics.value[1].value = resMetrics.data.dailyLeakage
      metrics.value[2].value = resMetrics.data.nrwRate
      metrics.value[3].value = resMetrics.data.activeAlarms
    }
  } catch (e) { /* fallback */
    metrics.value[0].value = 12500
    metrics.value[1].value = 1800
    metrics.value[2].value = 14.4
    metrics.value[3].value = 5
  }
  try {
    const resTrend: any = await request.get('/api/v1/scada/overview/trend')
    if (resTrend && resTrend.code === 200) {
      trendOption.value.xAxis.data = resTrend.data.hours
      trendOption.value.series[0].data = resTrend.data.supplyValues
      trendOption.value.series[1].data = resTrend.data.leakageValues
    }
  } catch (e) { /* fallback */
    trendOption.value.xAxis.data = ['00:00','04:00','08:00','12:00','16:00','20:00','24:00']
    trendOption.value.series[0].data = [300, 250, 600, 550, 480, 520, 350]
    trendOption.value.series[1].data = [20, 25, 45, 40, 35, 42, 28]
  }
  try {
    const resWater: any = await request.get('/api/v1/scada/overview/water-quality')
    if (resWater && resWater.code === 200) {
      waterQualityOption.value.series[0].data[0].value = resWater.data.turbidity
      waterQualityOption.value.series[1].data[0].value = resWater.data.chlorine
      waterQualityOption.value.series[2].data[0].value = resWater.data.ph
      complianceRate.value = resWater.data.complianceRate
    }
  } catch (e) { /* fallback */
    waterQualityOption.value.series[0].data[0].value = 0.5
    waterQualityOption.value.series[1].data[0].value = 0.8
    waterQualityOption.value.series[2].data[0].value = 7.2
  }
  try {
    await Promise.all([
      fetchEnergyTrend(),
      fetchAlarms()
    ])
  } catch (e) { /* fallback */ }
  loading.value = false
}
onMounted(() => {
  fetchData()
})
</script>
<style scoped>
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-flex: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
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

/* KPI 区域 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
  background: var(--el-bg-color-page);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 36px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-family: "SF Mono", Consolas, monospace;
  line-height: 1;
}

.metric-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

/* 面板头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.highlight-text {
  color: var(--el-color-success);
  font-weight: 600;
  font-family: "SF Mono", monospace;
  background: var(--el-color-success-light-9);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.chart-container {
  flex: 1;
  min-height: 300px;
  }

.chart {
  width: 100%;
  height: 100%;
}

.alarm-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.pulse-tag {
  animation: pulse 2s infinite;
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
  color: var(--el-color-success);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--el-color-success-light-5); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}



.kpi-card {
  flex-direction: row;
  align-items: center;
  height: 120px;
  padding: 0 24px;
}
.kpi-card .metric-icon-wrap {
  margin-bottom: 0;
  margin-right: 20px;
  width: 56px;
  height: 56px;
  font-size: 28px;
  flex-shrink: 0;
}
.kpi-card .metric-info {
  justify-content: center;
}

</style>
