<template>
  <div class="premium-container scada-overview">
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
      <el-col :span="6" v-for="(item, index) in metrics" :key="index">
        <div class="glass-panel metric-card">
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
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="12">
        <div class="glass-panel chart-card">
          <div class="panel-header">
            <div class="panel-title">水质综合看板 <span>Water Quality</span></div>
            <div class="panel-extra">
              <span class="highlight-text">达标率: {{ complianceRate }}%</span>
            </div>
          </div>
          <div class="chart-container" v-loading="loading" element-loading-background="rgba(0,0,0,0.5)">
            <v-chart class="chart" :option="waterQualityOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="glass-panel chart-card">
          <div class="panel-header">
            <div class="panel-title">能耗折标煤趋势 <span>Energy Trend</span></div>
            <el-radio-group v-model="energyTrendRange" size="small" class="custom-radio" @change="fetchEnergyTrend">
              <el-radio-button label="7days">7天</el-radio-button>
              <el-radio-button label="30days">30天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container" v-loading="loading" element-loading-background="rgba(0,0,0,0.5)">
            <v-chart class="chart" :option="energyTrendOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 供水漏损趋势与报警列表 -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="16">
        <div class="glass-panel chart-card large-chart">
          <div class="panel-header">
            <div class="panel-title">供水与漏损趋势 <span>Supply & Leakage</span></div>
            <el-tag type="info" effect="dark" class="dark-tag">1h 聚合</el-tag>
          </div>
          <div class="chart-container" v-loading="loading" element-loading-background="rgba(0,0,0,0.5)">
            <v-chart class="chart" :option="trendOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="glass-panel list-card">
          <div class="panel-header">
            <div class="panel-title">活跃异常报警 <span>Active Alarms</span></div>
            <el-button link class="neon-btn">处理</el-button>
          </div>
          <div class="alarm-list custom-scrollbar">
            <el-empty v-if="!metrics[3] || metrics[3].value === 0" description="运行正常" :image-size="60" />
            <el-timeline v-else class="dark-timeline">
              <el-timeline-item
                v-for="(activity, index) in alarms"
                :key="index"
                :type="activity.type"
                :color="activity.color || '#00d8ff'"
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
import { ref, onMounted } from 'vue'
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
  { title: '今日总供水量', value: 0, unit: 'm³', icon: Odometer, color: '#409EFF' },
  { title: '今日总漏水量', value: 0, unit: 'm³', icon: Opportunity, color: '#E6A23C' },
  { title: '实时产销差率', value: 0, unit: '%', icon: DataLine, color: '#67C23A' },
  { title: '活跃异常报警', value: 0, unit: '条', icon: WarnTriangleFilled, color: '#F56C6C' },
])

const trendOption = ref({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e2e8f0' } },
  legend: { data: ['供水量 (m³/h)', '漏水量 (m³/h)'], textStyle: { color: '#94a3b8' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [], axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#334155' } } },
  yAxis: { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } } },
  series: [
    {
      name: '供水量 (m³/h)',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: { color: '#00d8ff' },
      lineStyle: { width: 3, shadowColor: 'rgba(0,216,255,0.5)', shadowBlur: 10 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(0, 216, 255, 0.4)' }, { offset: 1, color: 'rgba(0, 216, 255, 0)' }]
        }
      }
    },
    {
      name: '漏水量 (m³/h)',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: { color: '#f59e0b' },
      lineStyle: { width: 3, shadowColor: 'rgba(245,158,11,0.5)', shadowBlur: 10 }
    }
  ]
})

const waterQualityOption = ref({
  tooltip: { formatter: '{a} <br/>{b} : {c}', backgroundColor: 'rgba(15, 23, 42, 0.9)', textStyle: { color: '#e2e8f0' }, borderColor: 'rgba(255,255,255,0.1)' },
  series: [
    {
      name: '浊度 (NTU)',
      type: 'gauge',
      center: ['20%', '50%'],
      radius: '75%',
      min: 0,
      max: 5,
      axisLine: { lineStyle: { width: 10, color: [[0.2, '#10b981'], [0.8, '#f59e0b'], [1, '#ef4444']] } },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -10, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -10, length: 10, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { color: '#94a3b8', distance: 15, fontSize: 10 },
      detail: { fontSize: 14, formatter: '{value} NTU', color: '#e2e8f0' },
      data: [{ value: 0, name: '浊度' }],
      title: { color: '#94a3b8', fontSize: 12, offsetCenter: [0, '70%'] }
    },
    {
      name: '余氯 (mg/L)',
      type: 'gauge',
      center: ['50%', '50%'],
      radius: '75%',
      min: 0,
      max: 2,
      axisLine: { lineStyle: { width: 10, color: [[0.15, '#ef4444'], [0.8, '#10b981'], [1, '#f59e0b']] } },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -10, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -10, length: 10, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { color: '#94a3b8', distance: 15, fontSize: 10 },
      detail: { fontSize: 14, formatter: '{value} mg/L', color: '#e2e8f0' },
      data: [{ value: 0, name: '余氯' }],
      title: { color: '#94a3b8', fontSize: 12, offsetCenter: [0, '70%'] }
    },
    {
      name: 'pH值',
      type: 'gauge',
      center: ['80%', '50%'],
      radius: '75%',
      min: 0,
      max: 14,
      axisLine: { lineStyle: { width: 10, color: [[0.45, '#ef4444'], [0.6, '#10b981'], [1, '#ef4444']] } },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -10, length: 4, lineStyle: { color: '#fff', width: 1 } },
      splitLine: { distance: -10, length: 10, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { color: '#94a3b8', distance: 15, fontSize: 10 },
      detail: { fontSize: 14, formatter: '{value}', color: '#e2e8f0' },
      data: [{ value: 0, name: 'pH值' }],
      title: { color: '#94a3b8', fontSize: 12, offsetCenter: [0, '70%'] }
    }
  ]
})

const energyTrendOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e2e8f0' } },
  legend: { data: ['水耗折标煤', '电耗折标煤', '气耗折标煤'], textStyle: { color: '#94a3b8' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: [], axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#334155' } } },
  yAxis: { type: 'value', name: 'kgce', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } } },
  series: [
    { name: '水耗折标煤', type: 'bar', stack: 'total', data: [], itemStyle: { color: '#3b82f6', borderRadius: [0, 0, 0, 0] } },
    { name: '电耗折标煤', type: 'bar', stack: 'total', data: [], itemStyle: { color: '#10b981', borderRadius: [0, 0, 0, 0] } },
    { name: '气耗折标煤', type: 'bar', stack: 'total', data: [], itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } }
  ]
})

const alarms = ref<any[]>([])

const fetchAlarms = async () => {
  try {
    const res = await request.get('/api/data-center/overview/alarms')
    alarms.value = res || []
  } catch (error) {
    console.error(error)
  }
}

const fetchEnergyTrend = async () => {
  try {
    const res = await request.get('/api/data-center/overview/energy-trend', { params: { range: energyTrendRange.value } })
    energyTrendOption.value.xAxis.data = res.dates
    energyTrendOption.value.series[0].data = res.waterEnergy
    energyTrendOption.value.series[1].data = res.elecEnergy
    energyTrendOption.value.series[2].data = res.gasEnergy
  } catch (error) {
    console.error(error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const resMetrics = await request.get('/api/data-center/overview/metrics')
    metrics.value[0].value = resMetrics.dailySupply
    metrics.value[1].value = resMetrics.dailyLeakage
    metrics.value[2].value = resMetrics.nrwRate
    metrics.value[3].value = resMetrics.activeAlarms

    const resTrend = await request.get('/api/data-center/overview/trend')
    trendOption.value.xAxis.data = resTrend.hours
    trendOption.value.series[0].data = resTrend.supplyValues
    trendOption.value.series[1].data = resTrend.leakageValues

    const resWater = await request.get('/api/data-center/overview/water-quality')
    waterQualityOption.value.series[0].data[0].value = resWater.turbidity
    waterQualityOption.value.series[1].data[0].value = resWater.chlorine
    waterQualityOption.value.series[2].data[0].value = resWater.ph
    complianceRate.value = resWater.complianceRate
    
    await Promise.all([
      fetchEnergyTrend(),
      fetchAlarms()
    ])
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
.premium-container {
  padding: 24px;
  background: radial-gradient(circle at 50% 0%, #0a192f 0%, #020617 100%);
  min-height: calc(100vh - 60px);
  color: #e2e8f0;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}

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

.pulse-tag {
  animation: pulse 2s infinite;
  background-color: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.glass-panel {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(0, 216, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 216, 255, 0.1);
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 24px;
  height: 120px;
}

.metric-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  margin-right: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  font-family: "SF Mono", monospace;
  line-height: 1;
}

.metric-unit {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin-left: 4px;
  font-family: "SF Pro Display", sans-serif;
}

.chart-card, .list-card {
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 20px;
}

.large-chart {
  height: 420px;
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

.highlight-text {
  color: #34d399;
  font-weight: 600;
  font-family: "SF Mono", monospace;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

.dark-tag {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
}

.neon-btn {
  color: #00d8ff;
  font-weight: 500;
}

.neon-btn:hover {
  color: #ffffff;
  text-shadow: 0 0 8px #00d8ff;
}

.chart-container {
  flex: 1;
  width: 100%;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.alarm-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.dark-timeline :deep(.el-timeline-item__content) {
  color: #e2e8f0;
  font-size: 14px;
}

.dark-timeline :deep(.el-timeline-item__timestamp) {
  color: #64748b;
  font-size: 12px;
  font-family: "SF Mono", monospace;
}

:deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #00d8ff;
  border-color: #00d8ff;
  color: #020617;
  box-shadow: 0 0 10px rgba(0, 216, 255, 0.3);
}

:deep(.el-empty__description) {
  color: #64748b;
}
</style>
