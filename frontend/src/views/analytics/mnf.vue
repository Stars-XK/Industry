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
      backgroundColor: 'var(--el-bg-color-overlay)',
      borderColor: 'var(--el-border-color-light)',
      textStyle: { color: 'var(--el-text-color-primary)' }
    },
    legend: { textStyle: { color: 'var(--el-text-color-secondary)' } },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: 'var(--el-text-color-regular)' },
      axisLine: { lineStyle: { color: 'var(--el-border-color-darker)' } }
    },
    yAxis: {
      type: 'value',
      name: '水量 m³',
      nameTextStyle: { color: 'var(--el-text-color-regular)' },
      axisLabel: { color: 'var(--el-text-color-regular)' },
      splitLine: { lineStyle: { color: 'var(--el-border-color-light)', type: 'dashed' } }
    },
    series: [
      {
        name: '实际夜间流量',
        type: 'scatter',
        data: actualData,
        symbolSize: 12,
        itemStyle: { color: 'var(--el-color-danger)', shadowColor: 'var(--el-color-danger-light-5)', shadowBlur: 10 }
      },
      {
        name: 'AI 正常基线',
        type: 'line',
        data: baselineData,
        lineStyle: { type: 'dashed', color: 'var(--el-color-success)', width: 2 }
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

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 32px;
}
.banner-icon {
  font-size: 28px;
  color: var(--el-color-warning);
  margin-top: 2px;
}
.banner-content {
  flex: 1;
}
.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-warning);
  margin-bottom: 6px;
}
.banner-desc {
  font-size: 14px;
  color: var(--el-color-warning);
  opacity: 0.9;
}

.chart-wrapper {
  height: 460px;
  width: 100%;
  flex: 1;
}
.chart-inner {
  width: 100%;
  height: 100%;
}
</style>
