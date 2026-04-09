<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">夜间最小流量分析</h1>
        <p class="page-subtitle">Minimum Night Flow (MNF) Analysis</p>
      </div>
      <div class="header-actions">
        <el-button >生成听漏工单</el-button>
      </div>
    </div>

    <el-row :gutter="24" v-loading="loading">
      <el-col :span="24" v-if="hasAnomaly">
        <div class="warning-banner">
          <el-icon class="banner-icon"><WarningFilled /></el-icon>
          <div class="banner-content">
            <div class="banner-title">检测到 {{ anomalyZone }} 连续3天凌晨 2:00 - 4:00 用量偏离 AI 基线</div>
            <div class="banner-desc">建议立即排查物理暗漏或未授权用水行为</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="box-card" style="padding: 20px;">
          <div class="panel-header">
            <div class="panel-title">凌晨 2:00 - 4:00 供水散点图 <span>MNF Scatter Plot</span></div>
          </div>
          <div class="chart-wrapper">
            <div id="mnf-chart" class="chart-inner"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getMNFData } from '@/api/analytics'

const loading = ref(false)
const hasAnomaly = ref(false)
const anomalyZone = ref('未知分区')

const initChart = (dates: string[], actualData: number[], baselineData: number[]) => {
  const dom = document.getElementById('mnf-chart')
  if (!dom) return
  const chart = echarts.init(dom)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e2e8f0' }
    },
    legend: { textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#64748b' },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      name: '水量 m³',
      nameTextStyle: { color: '#64748b' },
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
    },
    series: [
      {
        name: '实际夜间流量',
        type: 'scatter',
        data: actualData,
        symbolSize: 12,
        itemStyle: { color: '#f43f5e', shadowColor: 'rgba(244,63,94,0.5)', shadowBlur: 10 }
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
        initChart(res.data.dates, res.data.actual, res.data.baseline)
      })
    }
  } catch (error) {
    // Fallback if API is missing
    hasAnomaly.value = true
    anomalyZone.value = '东海园区'
    nextTick(() => {
      initChart(['1日', '2日', '3日', '4日', '5日', '6日', '7日'], [12, 11, 13, 25, 28, 26, 29], [10, 10, 10, 10, 10, 10, 10])
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>
<style scoped>

.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar, .header-actions {
  display: flex;
  gap: 12px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}




.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.banner-icon {
  font-size: 24px;
  color: #f59e0b;
  margin-top: 2px;
}
.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: #fcd34d;
  margin-bottom: 4px;
}
.banner-desc {
  font-size: 13px;
  color: #fbbf24;
  opacity: 0.8;
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
  color: var(--el-text-color-primary);
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
.chart-wrapper {
  height: 460px;
  width: 100%;
}
.chart-inner {
  width: 100%;
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
</style>
