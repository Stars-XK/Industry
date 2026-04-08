<template>
  <div class="premium-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">夜间最小流量分析</h1>
        <p class="page-subtitle">Minimum Night Flow (MNF) Analysis</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn">生成听漏工单</el-button>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :span="24">
        <div class="warning-banner">
          <el-icon class="banner-icon"><WarningFilled /></el-icon>
          <div class="banner-content">
            <div class="banner-title">检测到 张江园区 连续3天凌晨 2:00 - 4:00 用量偏离 AI 基线</div>
            <div class="banner-desc">建议立即排查物理暗漏或未授权用水行为</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="glass-panel" style="padding: 20px;">
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
import { onMounted } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const initChart = () => {
  const chart = echarts.init(document.getElementById('mnf-chart'))
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
      data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
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
        data: [12, 11, 13, 25, 28, 26, 29], 
        symbolSize: 12, 
        itemStyle: { color: '#f43f5e', shadowColor: 'rgba(244,63,94,0.5)', shadowBlur: 10 } 
      },
      { 
        name: 'AI 正常基线', 
        type: 'line', 
        data: [10, 10, 10, 10, 10, 10, 10], 
        lineStyle: { type: 'dashed', color: '#10b981', width: 2 } 
      }
    ]
  })
}
onMounted(() => setTimeout(initChart, 100))
</script>
<style scoped>
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
.chart-wrapper {
  height: 460px;
  width: 100%;
}
.chart-inner {
  width: 100%;
  height: 100%;
}
</style>
