<template>
  <div class="box-card" v-loading="loading" style="height: 380px;">
    <div class="panel-header">
      <div class="panel-title">历史趋势及同环比分析 <span>Historical Trend</span></div>
    </div>
    <div ref="chartRef" class="trend-chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, TooltipComponent, TitleComponent, GridComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  loading: boolean
  months: string[]
  ratios: number[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
  }
  if (!chartInstance) return

  const option = {
    tooltip: { 
      trigger: 'axis', 
      formatter: '{b} <br/> 产销差率: {c}%', 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      borderColor: '#e4e7ed', 
      textStyle: { color: '#303133' } 
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: props.months, 
      boundaryGap: false, 
      axisLabel: { color: '#606266' }, 
      axisLine: { lineStyle: { color: '#c0c4cc' } } 
    },
    yAxis: { 
      type: 'value', 
      name: 'NRW (%)', 
      nameTextStyle: { color: '#606266' }, 
      axisLabel: { formatter: '{value} %', color: '#606266' }, 
      splitLine: { lineStyle: { color: '#e4e7ed', type: 'dashed' } } 
    },
    series: [
      {
        name: '产销差率',
        type: 'line',
        data: props.ratios,
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
  chartInstance.setOption(option)
}

watch(() => [props.months, props.ratios], () => {
  renderChart()
}, { deep: true })

const handleResize = () => {
  if (chartInstance) chartInstance.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
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

.trend-chart {
  width: 100%;
  flex: 1;
  min-height: 300px;
}
</style>