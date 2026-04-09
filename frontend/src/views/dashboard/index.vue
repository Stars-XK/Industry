<template>
  <div class="app-container wide-panel">
    <!-- Full-bleed background map -->
    <div id="twin-map" class="map-container"></div>

    <!-- Floating Header -->
    <div class="header">
      <div class="title">信创工业水务数字孪生调度大屏</div>
      <div class="time">{{ currentTime }}</div>
      <el-button class="exit-btn" type="primary" size="small" @click="goHome">进入系统后台</el-button>
    </div>

    <!-- Center Top Floating Stats -->
    <div class="map-overlay">
      <div class="map-stats">
        <div class="stat-item"><span class="dot green"></span>在线设备: 1,423</div>
        <div class="stat-item"><span class="dot red"></span>离线报警: 12</div>
        <div class="stat-item"><span class="dot yellow"></span>维修中: 5</div>
      </div>
    </div>

    <!-- Left Floating Panel -->
    <div class="left-panel panel">
      <div class="panel-title">综合KPI概览</div>
      <div class="kpi-box">
        <div class="kpi-item">
          <div class="kpi-label">本月总供水 (m³)</div>
          <div class="kpi-value text-blue">{{ kpi.supply.toLocaleString() }}</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">本月总售水 (m³)</div>
          <div class="kpi-value text-green">{{ kpi.sales.toLocaleString() }}</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">当月产销差率</div>
          <div class="kpi-value text-yellow">{{ kpi.nrw }}%</div>
        </div>
      </div>

      <div class="panel-title" style="margin-top: auto; margin-bottom: 20px;">全网水压监测分布</div>
      <div id="pressure-chart" class="chart-box"></div>
    </div>

    <!-- Right Floating Panel -->
    <div class="right-panel panel">
      <div class="panel-title">实时报警事件 (Top 5)</div>
      <div class="alarm-list">
        <div class="alarm-item" v-for="(item, index) in alarms" :key="index">
          <span class="alarm-time">{{ item.time }}</span>
          <span class="alarm-level" :class="item.level">{{ item.level }}</span>
          <span class="alarm-desc">{{ item.desc }}</span>
        </div>
      </div>

      <div class="panel-title" style="margin-top: auto; margin-bottom: 20px;">泵房能效分析</div>
      <div id="energy-chart" class="chart-box"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import * as echarts from 'echarts'

const router = useRouter()
const currentTime = ref('')
let timer: any = null
let mapChart: any = null
let pressureChart: any = null
let energyChart: any = null

const kpi = ref<Record<string, number>>({ supply: 124532, sales: 112410, nrw: 9.73 })

const alarms = ref<Record<string, string>[]>([
  { time: '14:23:11', level: 'HH', desc: '一厂区出水压力超高限' },
  { time: '14:15:02', level: 'H', desc: '鲤城泵站余氯偏高' },
  { time: '13:45:55', level: 'L', desc: '东海园区流量异常下降' },
  { time: '13:10:20', level: 'HH', desc: '2号储水池液位低低报' },
  { time: '12:05:00', level: 'H', desc: '网关 GW-002 CPU 负载高' }
])

const fetchKpi = async () => {
  try {
    const res: any = await request.get('/api/v1/data-center/dashboard/kpi')
    kpi.value = res.data || res || {
      supply: 154200,
      electricity: 32540,
      pressure: 0.32,
      quality: 99.9
    }
  } catch (e) {
    console.error('获取 KPI 失败:', e)
    // 降级假数据
    kpi.value = { supply: 154200, electricity: 32540, pressure: 0.32, quality: 99.9 }
  }
}

const fetchAlarms = async () => {
  try {
    const res: any = await request.get('/api/v1/data-center/dashboard/alarms')
    const data = res.data || res || []
    if (data && data.length > 0) {
      alarms.value = data
    }
  } catch (e) {
    console.error('获取报警失败:', e)
    // 降级假数据
    alarms.value = [
      { time: '14:23:11', level: 'HH', desc: '[丰泽] 东海园区主干管瞬时压力突降 15%' },
      { time: '14:15:02', level: 'H', desc: '[鲤城] 地下泵站环境湿度偏高 85%' },
      { time: '13:45:55', level: 'L', desc: '[核心] 2号水泵变频器通讯心跳延迟' }
    ]
  }
}

const goHome = () => {
  router.push('/scada/overview')
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString()
}

const initCharts = () => {
  // 压力分布图
  pressureChart = echarts.init(document.getElementById('pressure-chart'))
  pressureChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLine: { lineStyle: { color: '#606266' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#e4e7ed' } }, axisLabel: { color: '#606266' } },
    series: [
      { name: '管网平均压力', type: 'line', smooth: true, data: [0.32, 0.35, 0.45, 0.41, 0.43, 0.38, 0.33], itemStyle: { color: '#3b82f6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(59, 130, 246, 0.5)'}, {offset: 1, color: 'transparent'}]) } }
    ]
  })

  // 能效分析图
  energyChart = echarts.init(document.getElementById('energy-chart'))
  energyChart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '能耗占比',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: { borderRadius: 10, borderColor: 'transparent', borderWidth: 2 },
        label: { color: '#606266' },
        data: [
          { value: 1048, name: '1号泵房' },
          { value: 735, name: '2号泵房' },
          { value: 580, name: '3号泵房' },
          { value: 484, name: '加药车间' },
          { value: 300, name: '厂区照明' }
        ]
      }
    ]
  })

  // 伪 3D 拓扑图 / 散点图代替孪生地图
  mapChart = echarts.init(document.getElementById('twin-map'))
  const data = []
  for (let i = 0; i < 50; i++) {
    data.push([
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100
    ])
  }
  mapChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {},
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [{
      type: 'effectScatter',
      symbolSize: 15,
      itemStyle: { color: '#3b82f6', shadowBlur: 10, shadowColor: 'rgba(59, 130, 246, 0.5)' },
      data: [
        [50, 50, '中心泵站'], [20, 80, 'A区供水点'], [80, 20, 'B区出水点'], [30, 30, 'C区管网节点'], [70, 70, 'D区阀门井']
      ],
      tooltip: {
        formatter: (params: any) => `${params.data[2]}<br/>状态: 正常<br/>压力: 0.42 MPa`
      }
    },
    {
      type: 'lines',
      coordinateSystem: 'cartesian2d',
      lineStyle: { color: '#3b82f6', width: 2, opacity: 0.4, curveness: 0.2 },
      effect: { show: true, period: 4, symbolSize: 5, color: '#d9e8ff', trailLength: 0.1 },
      data: [
        { coords: [[50, 50], [20, 80]] },
        { coords: [[50, 50], [80, 20]] },
        { coords: [[50, 50], [30, 30]] },
        { coords: [[50, 50], [70, 70]] }
      ]
    }]
  })
}

onMounted(() => {
  updateTime()
  fetchKpi()
  fetchAlarms()
  timer = setInterval(() => {
    updateTime()
    fetchAlarms()
  }, 5000)
  setTimeout(initCharts, 100)

  window.addEventListener('resize', () => {
    mapChart?.resize()
    pressureChart?.resize()
    energyChart?.resize()
  })
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.app-container wide-panel {
  width: 100vw;
  height: 100vh;
  background-color: var(--el-bg-color-page);
  background-image: radial-gradient(circle at 50% 50%, var(--el-fill-color-darker) 0%, var(--el-bg-color-page) 100%);
  color: var(--el-text-color-primary);
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.map-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, var(--el-color-primary-light-9) 0%, transparent 100%);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}

.header > * {
  pointer-events: auto;
}

.title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--el-text-color-primary);
  text-shadow: 0 0 20px var(--el-color-primary-light-5);
}

.time {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--el-text-color-regular);
  letter-spacing: 1px;
}

.exit-btn {
  position: absolute;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 1px solid var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}

.exit-btn:hover {
  background: var(--el-color-primary-light-9);
  box-shadow: 0 0 15px var(--el-color-primary-light-5);
}

.panel {
  position: absolute;
  top: 100px;
  bottom: 24px;
  width: 360px;
  background: var(--el-bg-color-overlay);
  backdrop-filter: blur(12px);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--el-box-shadow);
  z-index: 10;
}

.left-panel {
  left: 24px;
}

.right-panel {
  right: 24px;
}
.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  letter-spacing: 1px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.panel-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: var(--el-color-primary);
  margin-right: 12px;
  border-radius: 2px;
  box-shadow: 0 0 8px var(--el-color-primary-light-5);
}
.map-overlay {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: var(--el-bg-color-overlay);
  backdrop-filter: blur(12px);
  padding: 16px 32px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 30px;
  box-shadow: var(--el-box-shadow-light);
}
.map-stats {
  display: flex;
  gap: 32px;
  align-items: center;
}

.kpi-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kpi-item {
  background: var(--el-fill-color-light);
  border-left: 2px solid var(--el-border-color-light);
  padding: 16px 20px;
  border-radius: 4px;
  transition: transform 0.3s ease, background 0.3s, border-color 0.3s;
}
.kpi-item:hover {
  transform: translateX(4px);
  background: var(--el-color-primary-light-9);
  border-left-color: var(--el-color-primary);
}
.kpi-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.kpi-value {
  font-size: 32px;
  font-weight: 300;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}
.text-blue { color: var(--el-color-primary); text-shadow: 0 0 10px var(--el-color-primary-light-5); }
.text-green { color: var(--el-color-success); text-shadow: 0 0 10px var(--el-color-success-light-5); }
.text-yellow { color: var(--el-color-warning); text-shadow: 0 0 10px var(--el-color-warning-light-5); }
.chart-box {
  flex: 1;
  width: 100%;
  min-height: 200px;
}
.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alarm-item {
  display: flex;
  align-items: center;
  background: var(--el-fill-color-light);
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.alarm-item:hover {
  background: var(--el-color-primary-light-9);
}
.alarm-time { width: 65px; color: var(--el-text-color-regular); font-size: 12px; font-family: monospace; }
.alarm-level { width: 36px; font-weight: 600; text-align: center; font-size: 12px; border-radius: 4px; padding: 2px 0; margin-right: 12px; }
.alarm-desc { flex: 1; font-size: 13px; color: var(--el-text-color-regular); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.HH { background: var(--el-color-danger-light-9); color: var(--el-color-danger); border: 1px solid var(--el-color-danger-light-5); }
.H { background: var(--el-color-warning-light-9); color: var(--el-color-warning); border: 1px solid var(--el-color-warning-light-5); }
.L { background: var(--el-color-primary-light-9); color: var(--el-color-primary); border: 1px solid var(--el-color-primary-light-5); }

.stat-item {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.stat-item:last-child {
  margin-bottom: 0;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 12px;
}
.dot.green { background-color: var(--el-color-success); box-shadow: 0 0 8px var(--el-color-success-light-5); }
.dot.red { background-color: var(--el-color-danger); box-shadow: 0 0 8px var(--el-color-danger-light-5); }
.dot.yellow { background-color: var(--el-color-warning); box-shadow: 0 0 8px var(--el-color-warning-light-5); }
</style>
