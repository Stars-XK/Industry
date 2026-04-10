<template>
  <div class="box-card" v-loading="loading" style="min-height: 500px; margin-bottom: 24px;">
    <div class="panel-header">
      <div class="panel-title">水量平衡图 (IWA) <span>Sankey Diagram</span></div>
      <el-tag type="info" effect="dark" class="dark-tag">{{ currentZoneName || '未选择' }}</el-tag>
    </div>
    <div ref="chartRef" class="sankey-chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { SankeyChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  loading: boolean
  currentZoneName: string
  nodes: any[]
  links: any[]
}>()

const emit = defineEmits(['drill-down'])

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.on('click', (params: any) => {
      if (params.dataType === 'node' && params.data.name.includes('分区')) {
        emit('drill-down', params.data.name)
      }
    })
  }
  if (!chartInstance) return

  const option = {
    tooltip: { 
      trigger: 'item', 
      triggerOn: 'mousemove', 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      borderColor: '#e4e7ed', 
      textStyle: { color: '#303133' } 
    },
    series: [
      {
        type: 'sankey',
        data: props.nodes,
        links: props.links,
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
  chartInstance.setOption(option)
}

watch(() => props.nodes, () => {
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

.sankey-chart {
  width: 100%;
  flex: 1;
  min-height: 300px;
}
</style>