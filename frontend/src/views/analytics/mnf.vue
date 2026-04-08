<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">夜间最小流量分析 (MNF)</span>
          <el-button type="primary" size="default">生成听漏工单</el-button>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-alert 
            title="检测到 张江园区 连续3天凌晨 2:00 - 4:00 用量偏离 AI 基线，建议排查物理暗漏" 
            type="warning" 
            show-icon 
            :closable="false"
            class="alert-banner"
          />
        </el-col>
        <el-col :span="24">
          <div class="chart-wrapper">
            <div id="mnf-chart" class="chart-inner"></div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import * as echarts from 'echarts'

const initChart = () => {
  const chart = echarts.init(document.getElementById('mnf-chart'))
  chart.setOption({
    title: { text: '凌晨 2:00 - 4:00 供水散点图' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'] },
    yAxis: { type: 'value', name: '水量 m³' },
    series: [
      { name: '实际夜间流量', type: 'scatter', data: [12, 11, 13, 25, 28, 26, 29], symbolSize: 10, itemStyle: { color: '#F56C6C' } },
      { name: 'AI 正常基线', type: 'line', data: [10, 10, 10, 10, 10, 10, 10], lineStyle: { type: 'dashed', color: '#67C23A' } }
    ]
  })
}
onMounted(() => setTimeout(initChart, 100))
</script>
<style scoped>
.page-container {
  padding: 24px;
  background: #f4f6f8;
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.alert-banner {
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.chart-wrapper {
  height: 460px;
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  background-color: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
}

.chart-inner {
  width: 100%;
  height: 100%;
}
</style>
