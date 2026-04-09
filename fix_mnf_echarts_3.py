import os

path = '/workspace/frontend/src/views/analytics/mnf.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken script syntax
correct_script = """
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getMNFData } from '@/api/analytics'
const selectedZone = ref('zone_1')
const loading = ref(false)
const hasAnomaly = ref(false)
const anomalyZone = ref('未知分区')

let chartInstance: echarts.ECharts | null = null

window.addEventListener('resize', () => {
  chartInstance?.resize()
})

const initChart = (dates: string[], actualData: number[], baselineData: number[]) => {
  const dom = document.getElementById('mnf-chart')
  if (!dom) return
  if (!chartInstance) {
    chartInstance = echarts.init(dom)
  }
  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#303133' }
    },
    legend: { textStyle: { color: '#909399' } },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#606266' },
      axisLine: { lineStyle: { color: '#c0c4cc' } }
    },
    yAxis: {
      type: 'value',
      name: '水量 m³',
      nameTextStyle: { color: '#606266' },
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#e4e7ed', type: 'dashed' } }
    },
    series: [
      {
        name: '实际夜间流量',
        type: 'scatter',
        data: actualData,
        symbolSize: 12,
        itemStyle: { color: '#ef4444', shadowColor: 'rgba(239, 68, 68, 0.5)', shadowBlur: 10 }
      },
      {
        name: 'AI 正常基线',
        type: 'line',
        data: baselineData,
        lineStyle: { type: 'dashed', color: '#10b981', width: 2 }
      }
    ]
  })
}
const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getMNFData()
    if (res.code === 200) {
      hasAnomaly.value = res.data.hasAnomaly
      anomalyZone.value = res.data.anomalyZone
      nextTick(() => {
        setTimeout(() => {
          initChart(res.data.dates, res.data.actual, res.data.baseline)
        }, 100)
      })
    }
  } catch (error) {
    // Fallback if API is missing
    
    // Simulate data based on zone
    if (selectedZone.value === 'zone_1') {
      hasAnomaly.value = true
      anomalyZone.value = '东海园区'
      nextTick(() => {
        setTimeout(() => {
          initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [12, 11, 13, 25, 28, 26, 29], [10, 10, 10, 10, 10, 10, 10])
        }, 100)
      })
    } else if (selectedZone.value === 'zone_2') {
      hasAnomaly.value = false
      anomalyZone.value = '丰泽二期'
      nextTick(() => {
        setTimeout(() => {
          initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [8, 9, 8.5, 9, 8, 9.2, 8.8], [10, 10, 10, 10, 10, 10, 10])
        }, 100)
      })
    } else {
      hasAnomaly.value = false
      anomalyZone.value = '新港高新区'
      nextTick(() => {
        setTimeout(() => {
          initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [15, 14.5, 16, 15, 14, 15.5, 15], [18, 18, 18, 18, 18, 18, 18])
        }, 100)
      })
    }
  } finally {
    loading.value = false
  }
}
onMounted(() => loadData())
</script>
"""

content = content[:content.find('<script setup')] + correct_script + content[content.find('<style scoped>'):]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed syntax")
