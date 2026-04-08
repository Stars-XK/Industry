<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>夜间最小流量分析 (MNF)</span>
        <el-button style="float: right;" type="primary" size="small">生成听漏工单</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-alert title="检测到 张江园区 连续3天凌晨2-4点用量偏离 AI 基线，建议排查物理暗漏" type="warning" show-icon style="margin-bottom: 20px" />
        </el-col>
        <el-col :span="24">
          <div id="mnf-chart" style="height: 400px; width: 100%;"></div>
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
<style scoped>.app-container { padding: 20px; }</style>
