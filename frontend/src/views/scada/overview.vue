<template>
  <div class="page-container scada-overview">
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
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, DataZoomComponent])

const loading = ref(false)

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

const alarms = ref([
  { content: '1号水厂出水压力过低 (0.28 MPa)', timestamp: '10分钟前', type: 'danger', size: 'large' },
  { content: '2号泵站2#泵变频器通讯中断', timestamp: '45分钟前', type: 'warning' },
  { content: '高新区DMA夜间最小流量突增', timestamp: '2小时前', type: 'warning' },
  { content: '水质浊度传感器数值异常', timestamp: '3小时前', type: 'info' }
])

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
    trendOption.value.series[0].data = resTrend.values
    trendOption.value.series[1].data = resTrend.values.map(v => Math.round(v * 0.12)) // 模拟漏水趋势
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
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}
.metric-card {
  border: none;
  border-radius: 8px;
}
.metric-content {
  display: flex;
  align-items: center;
}
.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  margin-right: 16px;
}
.metric-info {
  flex: 1;
}
.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.metric-unit {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
  margin-left: 4px;
}
.chart-card {
  border: none;
  border-radius: 8px;
  height: 450px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-container {
  height: 350px;
}
.chart {
  width: 100%;
  height: 100%;
}
.alarm-list {
  height: 350px;
  overflow-y: auto;
  padding: 10px;
}
</style>
