<template>
  <div class="premium-container fade-in-up">
    <div class="glass-panel hover-lift">
      <div class="panel-header">
        <div>
          <div class="header-title">AI 用水趋势预测分析 (ARIMA / LSTM)</div>
          <div class="header-subtitle">Predictive Analytics & Forecasting</div>
        </div>
        <div class="header-actions">
          <el-select v-model="listQuery.zoneId" @change="fetchData" class="industrial-select" style="width: 240px" placeholder="选择预测区域">
            <el-option label="张江高科园区" value="201" />
            <el-option label="漕河泾开发区" value="202" />
          </el-select>
        </div>
      </div>

      <div class="model-info" v-if="predictData" v-loading="loading">
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">当前运行模型</div>
              <div class="stat-value text-blue">{{ predictData.model_type }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">历史拟合准确率</div>
              <div class="stat-value text-green">{{ Number(predictData.accuracy).toFixed(1) }}%</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">预测时间跨度</div>
              <div class="stat-value text-white">7 天</div>
            </div>
          </el-col>
          <el-col :span="6" class="action-col">
            <el-button class="neon-btn" :loading="loading" @click="fetchData">
              重新训练预测模型
            </el-button>
          </el-col>
        </el-row>
      </div>

      <div class="chart-container" v-loading="loading">
        <div id="predict-chart" class="predict-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import request from '@/utils/request'
import * as echarts from 'echarts'

const loading = ref(false)
const listQuery = ref({ zoneId: '201' })
const predictData = ref<any>(null)
let chartInstance: any = null

const initChart = () => {
  if (!chartInstance) {
    const chartDom = document.getElementById('predict-chart')
    if (chartDom) {
      chartInstance = echarts.init(chartDom)
    }
  }

  if (chartInstance && predictData.value) {
    const { dates, actualData, predictData: predData, upperBounds, lowerBounds } = predictData.value

    const option = {
      backgroundColor: 'transparent',
      title: { 
        text: '未来 7 天供水预测量 (m³)', 
        left: 'center',
        textStyle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'normal', fontFamily: 'SF Pro Display' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(0, 216, 255, 0.2)',
        textStyle: { color: '#e2e8f0' }
      },
      legend: {
        data: ['实际用量', 'AI 预测曲线', '置信区间'],
        bottom: 0,
        textStyle: { color: '#94a3b8' }
      },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '水量 (m³)',
        nameTextStyle: { color: '#94a3b8' },
        scale: true,
        axisLine: { show: false },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.05)', type: 'dashed' } }
      },
      series: [
        {
          name: '置信区间',
          type: 'line',
          data: upperBounds,
          lineStyle: { opacity: 0 },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: '置信区间',
          type: 'line',
          data: lowerBounds,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(0, 216, 255, 0.1)' },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: '实际用量',
          type: 'line',
          data: actualData,
          itemStyle: { color: '#67C23A' },
          lineStyle: { width: 3, shadowColor: 'rgba(103, 194, 58, 0.3)', shadowBlur: 10 },
          symbolSize: 8
        },
        {
          name: 'AI 预测曲线',
          type: 'line',
          data: predData,
          itemStyle: { color: '#00d8ff' },
          lineStyle: { type: 'dashed', width: 2, shadowColor: 'rgba(0, 216, 255, 0.3)', shadowBlur: 10 },
          symbol: 'emptyCircle',
          symbolSize: 6
        }
      ]
    }
    chartInstance.setOption(option)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await request({
      url: '/api/data-center/predict/demand',
      method: 'get',
      params: { zoneId: listQuery.value.zoneId }
    })
    predictData.value = data
    initChart()
  } catch (e) { /* fallback */ }
  loading.value = false
}

onMounted(() => {
  nextTick(() => {
    fetchData()
  })
})
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 16px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.5px;
}
.header-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.model-info {
  background: rgba(2, 6, 23, 0.3);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid rgba(148, 163, 184, 0.05);
}
.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  font-family: "SF Mono", Consolas, monospace;
}
.text-white { color: #e2e8f0; }
.text-blue { 
  color: #00d8ff; 
  text-shadow: 0 0 15px rgba(0, 216, 255, 0.3);
}
.text-green { 
  color: #67C23A; 
  text-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
}
.action-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.chart-container {
  height: 500px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.05);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.3);
  flex: 1;
}
.predict-chart {
  width: 100%;
  height: 100%;
}
:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  box-shadow: none !important;
}
:deep(.el-input__inner) {
  color: #e2e8f0 !important;
}
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #00d8ff !important;
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.2) !important;
}
</style>
