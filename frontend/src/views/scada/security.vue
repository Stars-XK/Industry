<template>
  <div class="page-container scada-security">
    <el-row :gutter="20" style="height: 100%;">
      <!-- 左侧：视频矩阵与沙盘 -->
      <el-col :span="16" class="left-panel">
        <el-card shadow="never" class="box-card video-card">
          <template #header>
            <div class="card-header">
              <span>视频监控矩阵墙 (RTSP/WebRTC)</span>
              <el-radio-group v-model="gridSize" size="small">
                <el-radio-button :label="1">单屏</el-radio-button>
                <el-radio-button :label="4">4分屏</el-radio-button>
                <el-radio-button :label="9">9分屏</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="video-grid" :class="`grid-${gridSize}`">
            <div v-for="n in gridSize" :key="n" class="video-cell">
              <div class="camera-label">
                <el-icon><VideoCamera /></el-icon> 摄像头 {{ n }}
              </div>
              <div class="signal-lost" v-if="n === 4 && gridSize > 1">
                <el-icon :size="40"><Warning /></el-icon>
                <div>信号丢失</div>
              </div>
              <div class="playing" v-else>
                <div class="live-badge">LIVE</div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="box-card sandbox-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>全景数字沙盘 (Video-in-3D 盲区分析)</span>
              <el-button type="primary" size="small" @click="simulateAlert('火情')">模拟火情报警</el-button>
            </div>
          </template>
          <div class="sandbox-container">
            <div class="sandbox-mock">
              <el-icon :size="50" color="#909399"><Location /></el-icon>
              <div>BIM 3D 模型渲染区</div>
              <div class="blind-spot">摄像头视锥体盲区分析</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：环境指标与联锁状态 -->
      <el-col :span="8" class="right-panel">
        <el-card shadow="never" class="box-card env-card">
          <template #header>
            <div class="card-header">
              <span>密闭空间环境指标</span>
              <el-tag :type="envStatus === 'normal' ? 'success' : 'danger'">
                {{ envStatus === 'normal' ? '环境正常' : '超标报警' }}
              </el-tag>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="envChartOption" autoresize />
          </div>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="label">温度</div>
              <div class="value">{{ temperature }} <span class="unit">°C</span></div>
            </div>
            <div class="metric-item">
              <div class="label">湿度</div>
              <div class="value">{{ humidity }} <span class="unit">%</span></div>
            </div>
            <div class="metric-item" :class="{ 'alert-text': envStatus !== 'normal' }">
              <div class="label">H₂S 浓度</div>
              <div class="value">{{ h2sValue }} <span class="unit">ppm</span></div>
            </div>
            <div class="metric-item">
              <div class="label">PM2.5</div>
              <div class="value">{{ pm25 }} <span class="unit">µg/m³</span></div>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="box-card interlock-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>门禁与安防联锁控制</span>
              <el-button type="danger" size="small" @click="simulateAlert('尾随')">模拟尾随</el-button>
            </div>
          </template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="当前联锁策略">高危气体超标强排风</el-descriptions-item>
            <el-descriptions-item label="1号排风扇状态">
              <el-switch v-model="fanStatus" disabled active-text="运行" inactive-text="停止" />
            </el-descriptions-item>
            <el-descriptions-item label="A区门禁状态">
              <el-tag :type="doorLocked ? 'danger' : 'success'">
                {{ doorLocked ? '已锁死 (防泄漏)' : '正常通行' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报警联动弹窗 -->
    <el-dialog v-model="alertVisible" :title="`${alertType}报警联动`" width="500px" custom-class="alert-dialog" :close-on-click-modal="false">
      <div class="alert-content">
        <el-icon class="alert-icon" :size="60" color="#F56C6C"><WarningFilled /></el-icon>
        <h3 style="color: #F56C6C;">检测到 {{ alertType }} 事件！</h3>
        <p v-if="alertType === '火情'">位置: 2号泵站地下管廊 A 区</p>
        <p v-if="alertType === '尾随'">位置: 主控室 1 号门</p>
        <div class="snapshot-mock">
          现场监控抓拍截图 (15秒视频片段)
        </div>
      </div>
      <template #footer>
        <el-button type="danger" @click="alertVisible = false">确认报警 (ACK)</el-button>
        <el-button type="primary" @click="createWorkOrder">一键转工单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'
import { VideoCamera, Warning, Location, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const gridSize = ref(4)
const envStatus = ref('normal')
const h2sValue = ref(5.2)
const coValue = ref(12.0)
const fanStatus = ref(false)
const doorLocked = ref(false)
const temperature = ref(26.5)
const humidity = ref(58)
const pm25 = ref(35)

const alertVisible = ref(false)
const alertType = ref('')

let simInterval: any = null

const envChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['H₂S (ppm)', 'CO (ppm)'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'H₂S (ppm)',
      type: 'line',
      data: [],
      itemStyle: { color: '#E6A23C' },
      smooth: true
    },
    {
      name: 'CO (ppm)',
      type: 'line',
      data: [],
      itemStyle: { color: '#909399' },
      smooth: true
    }
  ]
})

const simulateAlert = (type: string) => {
  alertType.value = type
  alertVisible.value = true
}

const createWorkOrder = () => {
  alertVisible.value = false
  ElMessage.success(`已成功将【${alertType}】报警转化为应急工单！`)
}

const fetchEnvironmentData = async () => {
  try {
    const res = await request.get('/api/scada/security/environment')
    
    // Check if status changed to alert
    if (res.envStatus === 'alert' && envStatus.value !== 'alert') {
      ElMessage.error('危险！H₂S 浓度超标，已触发联锁：开启排风扇并锁死门禁！')
    } else if (res.envStatus === 'normal' && envStatus.value === 'alert') {
      ElMessage.success('H₂S 浓度恢复正常，已解除联锁状态。')
    }

    envStatus.value = res.envStatus
    h2sValue.value = res.h2sValue
    coValue.value = res.coValue
    fanStatus.value = res.fanStatus
    doorLocked.value = res.doorLocked
    temperature.value = res.temperature
    humidity.value = res.humidity
    pm25.value = res.pm25
    
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    const xAxisData = envChartOption.value.xAxis.data as string[]
    const h2sData = envChartOption.value.series[0].data as number[]
    const coData = envChartOption.value.series[1].data as number[]

    if (xAxisData.length > 20) {
      xAxisData.shift()
      h2sData.shift()
      coData.shift()
    }

    xAxisData.push(timeStr)
    h2sData.push(res.h2sValue)
    coData.push(res.coValue)

  } catch (error) {
    console.error('获取环境数据失败:', error)
  }
}

onMounted(() => {
  fetchEnvironmentData()
  simInterval = setInterval(fetchEnvironmentData, 3000)
})

onUnmounted(() => {
  if (simInterval) {
    clearInterval(simInterval)
  }
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: calc(100vh - 100px);
  box-sizing: border-box;
  background-color: #0b1a2a;
  color: #fff;
}

.box-card {
  background-color: #112233;
  border-color: #1a3344;
  color: #fff;
}
:deep(.el-card__header) {
  border-bottom: 1px solid #1a3344;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-card {
  height: 45%;
}
.sandbox-card {
  height: calc(55% - 20px);
}
.env-card {
  height: 60%;
}
.interlock-card {
  height: calc(40% - 20px);
}

/* 视频矩阵 */
.video-grid {
  display: grid;
  gap: 10px;
  height: 100%;
}
.grid-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
.grid-4 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
.grid-9 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }

.video-cell {
  background: #000;
  border: 1px solid #334;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
}
.camera-label {
  position: absolute;
  top: 5px;
  left: 5px;
  background: rgba(0,0,0,0.6);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}
.live-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: red;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: bold;
  animation: blink 1s infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
.signal-lost {
  color: #F56C6C;
  text-align: center;
}

/* 沙盘 */
.sandbox-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.sandbox-mock {
  width: 80%;
  height: 80%;
  background: linear-gradient(45deg, #1a2a3a, #2a3a4a);
  border: 1px dashed #409EFF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  color: #909399;
}
.blind-spot {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(230, 162, 60, 0.2);
  border: 1px solid #E6A23C;
  color: #E6A23C;
  padding: 5px 10px;
  font-size: 12px;
}

/* 环境指标 */
.chart-container {
  height: 200px;
}
.chart {
  width: 100%;
  height: 100%;
}
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}
.metric-item {
  background: #1a2a3a;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}
.metric-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}
.metric-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
.metric-item .unit {
  font-size: 12px;
  font-weight: normal;
}
.alert-text .value {
  color: #F56C6C;
  animation: blink-text 1s infinite;
}
@keyframes blink-text {
  50% { opacity: 0.5; }
}

/* 弹窗样式 */
.alert-content {
  text-align: center;
}
.alert-icon {
  margin-bottom: 15px;
}
.snapshot-mock {
  margin-top: 20px;
  width: 100%;
  height: 150px;
  background: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  border: 1px dashed #666;
}

/* 调整 el-descriptions 的暗色适配 */
:deep(.el-descriptions__body) {
  background-color: transparent !important;
}
:deep(.el-descriptions-item__label) {
  background-color: #1a2a3a !important;
  color: #909399;
  border-color: #2a3a4a !important;
}
:deep(.el-descriptions-item__content) {
  background-color: #112233 !important;
  color: #fff;
  border-color: #2a3a4a !important;
}
</style>
