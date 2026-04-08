<template>
  <div class="dashboard-container">
    <div class="header">
      <div class="title">信创工业水务数字孪生调度大屏</div>
      <div class="time">{{ currentTime }}</div>
      <el-button class="exit-btn" type="primary" size="small" @click="goHome">进入系统后台</el-button>
    </div>

    <div class="main-content">
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

        <div class="panel-title" style="margin-top: 20px;">全网水压监测分布</div>
        <div id="pressure-chart" class="chart-box"></div>
      </div>

      <div class="center-panel">
        <div class="map-overlay">
          <div class="map-stats">
            <div class="stat-item"><span class="dot green"></span>在线设备: 1,423</div>
            <div class="stat-item"><span class="dot red"></span>离线报警: 12</div>
            <div class="stat-item"><span class="dot yellow"></span>维修中: 5</div>
          </div>
        </div>
        <div id="twin-map" class="map-container"></div>
      </div>

      <div class="right-panel panel">
        <div class="panel-title">实时报警事件 (Top 5)</div>
        <div class="alarm-list">
          <div class="alarm-item" v-for="(item, index) in alarms" :key="index">
            <span class="alarm-time">{{ item.time }}</span>
            <span class="alarm-level" :class="item.level">{{ item.level }}</span>
            <span class="alarm-desc">{{ item.desc }}</span>
          </div>
        </div>

        <div class="panel-title" style="margin-top: 20px;">泵房能效分析</div>
        <div id="energy-chart" class="chart-box"></div>
      </div>
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

const kpi = ref({ supply: 124532, sales: 112410, nrw: 9.73 })

const alarms = ref([
  { time: '14:23:11', level: 'HH', desc: '一厂区出水压力超高限' },
  { time: '14:15:02', level: 'H', desc: '徐汇泵站余氯偏高' },
  { time: '13:45:55', level: 'L', desc: '张江园区流量异常下降' },
  { time: '13:10:20', level: 'HH', desc: '2号储水池液位低低报' },
  { time: '12:05:00', level: 'H', desc: '网关 GW-002 CPU 负载高' }
])

const fetchKpi = async () => {
  try {
    const { data } = await request.get('/api/data-center/dashboard/kpi')
    kpi.value = data
  } catch (e) { console.error(e) }
}

const fetchAlarms = async () => {
  try {
    const { data } = await request.get('/api/data-center/dashboard/alarms')
    if (data && data.length > 0) {
      alarms.value = data
    }
  } catch (e) { console.error(e) }
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
    xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLine: { lineStyle: { color: '#ccc' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#ccc' } },
    series: [
      { name: '管网平均压力', type: 'line', smooth: true, data: [0.32, 0.35, 0.45, 0.41, 0.43, 0.38, 0.33], itemStyle: { color: '#00d8ff' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(0,216,255,0.5)'}, {offset: 1, color: 'rgba(0,216,255,0)'}]) } }
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
        itemStyle: { borderRadius: 10, borderColor: '#0b142b', borderWidth: 2 },
        label: { color: '#ccc' },
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
      itemStyle: { color: '#00d8ff', shadowBlur: 10, shadowColor: '#00d8ff' },
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
      lineStyle: { color: '#00d8ff', width: 2, opacity: 0.4, curveness: 0.2 },
      effect: { show: true, period: 4, symbolSize: 5, color: '#fff', trailLength: 0.1 },
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
.dashboard-container {
  width: 100vw;
  height: 100vh;
  background-color: #0b142b;
  background-image: radial-gradient(circle at 50% 50%, #152446 0%, #0b142b 100%);
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  height: 80px;
  background: url('https://img.alicdn.com/tfs/TB1J3yqXND1gK0jSZFsXXbldVXa-1920-80.png') no-repeat center center;
  background-size: cover;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #00d8ff;
  text-shadow: 0 0 10px rgba(0, 216, 255, 0.5);
}

.time {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 16px;
  color: #00d8ff;
}

.exit-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: rgba(0, 216, 255, 0.2);
  border: 1px solid #00d8ff;
  color: #00d8ff;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
}

.panel {
  width: 25%;
  background: rgba(13, 26, 56, 0.6);
  border: 1px solid rgba(0, 216, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 18px;
  color: #00d8ff;
  border-left: 4px solid #00d8ff;
  padding-left: 10px;
  margin-bottom: 15px;
}

.center-panel {
  width: 50%;
  position: relative;
  border: 1px solid rgba(0, 216, 255, 0.3);
  border-radius: 8px;
  background: rgba(13, 26, 56, 0.3);
}

.map-container {
  width: 100%;
  height: 100%;
}

.kpi-box {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.kpi-item {
  background: rgba(0, 216, 255, 0.1);
  padding: 15px;
  border-radius: 4px;
}

.kpi-label {
  font-size: 14px;
  color: #ccc;
  margin-bottom: 5px;
}

.kpi-value {
  font-size: 28px;
  font-weight: bold;
}

.text-blue { color: #00d8ff; }
.text-green { color: #67C23A; }
.text-yellow { color: #E6A23C; }

.chart-box {
  flex: 1;
  width: 100%;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alarm-item {
  display: flex;
  align-items: center;
  background: rgba(255, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #F56C6C;
}

.alarm-time { width: 70px; color: #ccc; font-size: 12px; }
.alarm-level { width: 40px; font-weight: bold; text-align: center; }
.alarm-desc { flex: 1; font-size: 14px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.HH { color: #F56C6C; }
.H { color: #E6A23C; }
.L { color: #409EFF; }

.map-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(13, 26, 56, 0.8);
  padding: 15px;
  border: 1px solid rgba(0, 216, 255, 0.3);
  border-radius: 4px;
}

.stat-item {
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
}
.dot.green { background-color: #67C23A; box-shadow: 0 0 5px #67C23A; }
.dot.red { background-color: #F56C6C; box-shadow: 0 0 5px #F56C6C; }
.dot.yellow { background-color: #E6A23C; box-shadow: 0 0 5px #E6A23C; }
</style>
