<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>AI 用水趋势预测分析看板 (ARIMA / LSTM)</span>
            <el-select v-model="listQuery.zoneId" @change="fetchData" style="float: right; width: 200px" placeholder="选择预测区域">
              <el-option label="张江高科园区" value="201" />
              <el-option label="漕河泾开发区" value="202" />
            </el-select>
          </div>
          
          <div class="model-info" v-if="predictData">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic title="当前运行模型" :value="predictData.model_type" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="历史拟合准确率 (%)" :value="predictData.accuracy" :precision="1" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="预测跨度 (天)" :value="7" />
              </el-col>
              <el-col :span="6">
                <el-button type="primary" :loading="loading" @click="fetchData" style="margin-top: 20px;">
                  触发 Python 脚本重训模型
                </el-button>
              </el-col>
            </el-row>
          </div>

          <div id="predict-chart" style="height: 500px; margin-top: 30px;"></div>
        </el-card>
      </el-col>
    </el-row>
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
.app-container {
  padding: 20px;
}
.model-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
