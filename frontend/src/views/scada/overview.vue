<template>
  <div class="page-container scada-overview">
    <!-- 核心 KPI 概览 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in metrics" :key="index">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" :style="{ backgroundColor: item.color + '20', color: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-title">{{ item.title }}</div>
              <div class="metric-value">
                {{ item.value }}
                <span class="metric-unit" v-if="item.unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 水质综合看板与能耗趋势 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>水质综合看板 (全网关键节点)</span>
              <el-tag type="success">历史达标率: {{ complianceRate }}%</el-tag>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <v-chart class="chart" :option="waterQualityOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近 7 天水电气能耗折标煤趋势</span>
              <el-radio-group v-model="energyTrendRange" size="small" @change="fetchEnergyTrend">
                <el-radio-button label="7days">近 7 天</el-radio-button>
                <el-radio-button label="30days">近 30 天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <v-chart class="chart" :option="energyTrendOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 供水漏损趋势与报警列表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近 24 小时管网供水与漏损趋势</span>
              <el-tag type="info">每小时聚合</el-tag>
            </div>
          </template>
          <div class="chart-container" v-loading="loading">
            <v-chart class="chart" :option="trendOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>当前管网异常报警状态</span>
              <el-button type="danger" link>查看更多</el-button>
            </div>
          </template>
          <div class="alarm-list">
            <el-empty v-if="!metrics[3] || metrics[3].value === 0" description="管网运行正常，无活跃报警" />
            <el-timeline v-else>
              <el-timeline-item
                v-for="(activity, index) in alarms"
                :key="index"
                :type="activity.type"
                :color="activity.color"
                :size="activity.size"
                :timestamp="activity.timestamp"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
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
  tooltip: { trigger: 'axis' },
  legend: { data: ['供水量 (m³/h)', '漏水量 (m³/h)'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '供水量 (m³/h)',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: { color: '#409EFF' },
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }
    },
    {
      name: '漏水量 (m³/h)',
      type: 'line',
      smooth: true,
      data: [],
      itemStyle: { color: '#E6A23C' }
    }
  ]
})

const waterQualityOption = ref({
  tooltip: { formatter: '{a} <br/>{b} : {c}' },
  series: [
    {
      name: '浊度 (NTU)',
      type: 'gauge',
      center: ['20%', '50%'],
      radius: '75%',
      min: 0,
      max: 5,
      axisLine: { lineStyle: { width: 10, color: [[0.2, '#67C23A'], [0.8, '#E6A23C'], [1, '#F56C6C']] } },
      pointer: { itemStyle: { color: 'auto' } },
      detail: { fontSize: 14, formatter: '{value} NTU' },
      data: [{ value: 0, name: '浊度' }]
    },
    {
      name: '余氯 (mg/L)',
      type: 'gauge',
      center: ['50%', '50%'],
      radius: '75%',
      min: 0,
      max: 2,
      axisLine: { lineStyle: { width: 10, color: [[0.15, '#F56C6C'], [0.8, '#67C23A'], [1, '#E6A23C']] } },
      pointer: { itemStyle: { color: 'auto' } },
      detail: { fontSize: 14, formatter: '{value} mg/L' },
      data: [{ value: 0, name: '余氯' }]
    },
    {
      name: 'pH值',
      type: 'gauge',
      center: ['80%', '50%'],
      radius: '75%',
      min: 0,
      max: 14,
      axisLine: { lineStyle: { width: 10, color: [[0.45, '#F56C6C'], [0.6, '#67C23A'], [1, '#F56C6C']] } },
      pointer: { itemStyle: { color: 'auto' } },
      detail: { fontSize: 14, formatter: '{value}' },
      data: [{ value: 0, name: 'pH值' }]
    }
  ]
})

const energyTrendOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['水耗折标煤', '电耗折标煤', '气耗折标煤'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value', name: 'kgce' },
  series: [
    { name: '水耗折标煤', type: 'bar', stack: 'total', data: [] },
    { name: '电耗折标煤', type: 'bar', stack: 'total', data: [] },
    { name: '气耗折标煤', type: 'bar', stack: 'total', data: [] }
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
.page-container {
  padding: 24px;
  background: #f4f6f8;
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.metric-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.metric-content {
  display: flex;
  align-items: center;
  padding: 8px 4px;
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  margin-right: 20px;
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
  color: #1f2d3d;
  font-family: "SF Pro Display", -apple-system, sans-serif;
  letter-spacing: -0.5px;
}

.metric-unit {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  margin-left: 4px;
}

.chart-card {
  border: none;
  border-radius: 12px;
  height: 420px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-card__body) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

.alarm-list::-webkit-scrollbar {
  width: 6px;
}

.alarm-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.alarm-list::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.el-timeline-item__content) {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
