<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">AI 用水趋势预测分析 (ARIMA / LSTM)</div>
          <div class="header-actions">
            <el-select v-model="listQuery.zoneId" @change="fetchData" style="width: 240px" placeholder="选择预测区域">
              <el-option label="张江高科园区" value="201" />
              <el-option label="漕河泾开发区" value="202" />
            </el-select>
          </div>
        </div>
      </template>

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
              <div class="stat-value">7 天</div>
            </div>
          </el-col>
          <el-col :span="6" class="action-col">
            <el-button type="primary" size="large" :loading="loading" @click="fetchData">
              重新训练预测模型
            </el-button>
          </el-col>
        </el-row>
      </div>

      <div class="chart-container" v-loading="loading">
        <div id="predict-chart" class="predict-chart"></div>
      </div>
    </el-card>
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
      title: { text: '未来 7 天供水预测量 (m³)', left: 'center' },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['实际用量', 'AI 预测曲线', '置信区间'],
        bottom: 10
      },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '水量 (m³)',
        scale: true
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
          areaStyle: { color: '#ccc', opacity: 0.3 },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: '实际用量',
          type: 'line',
          data: actualData,
          itemStyle: { color: '#67C23A' },
          lineStyle: { width: 3 },
          symbolSize: 8
        },
        {
          name: 'AI 预测曲线',
          type: 'line',
          data: predData,
          itemStyle: { color: '#409EFF' },
          lineStyle: { type: 'dashed', width: 2 },
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
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

onMounted(() => {
  nextTick(() => {
    fetchData()
  })
})
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

.model-info {
  background: linear-gradient(to right, #ffffff, #f8f9fa);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}

.text-blue { color: #409EFF; }
.text-green { color: #67C23A; }

.action-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.chart-container {
  height: 500px;
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  background-color: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
}

.predict-chart {
  width: 100%;
  height: 100%;
}
</style>
