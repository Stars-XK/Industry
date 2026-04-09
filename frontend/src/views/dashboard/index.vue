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
      { content: '[丰泽] 东海园区主干管瞬时压力突降 15%', type: 'critical' },
      { content: '[鲤城] 地下泵站环境湿度偏高 85%', type: 'warning' },
      { content: '[核心] 2号水泵变频器通讯心跳延迟', type: 'warning' }
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
  background-color: #050a15;
  background-image: radial-gradient(circle at 50% 50%, #0d1a38 0%, #050a15 100%);
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.header {
  height: 80px;
  background: linear-gradient(180deg, rgba(0, 216, 255, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(0, 216, 255, 0.1);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 216, 255, 0.4);
}
.time {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}
.exit-btn {
  position: absolute;
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 1px solid rgba(0, 216, 255, 0.4);
  color: var(--el-color-primary);
  border-radius: 4px;
  transition: all 0.3s ease;
}
.exit-btn:hover {
  background: rgba(0, 216, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 216, 255, 0.2);
}
.main-content {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
}
.panel {
  width: 25%;
  background: rgba(8, 15, 30, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.panel-title {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
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
  background: #00d8ff;
  margin-right: 12px;
  border-radius: 2px;
  box-shadow: 0 0 8px #00d8ff;
}
.center-panel {
  width: 50%;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  background: rgba(8, 15, 30, 0.4);
  overflow: hidden;
}
.map-container {
  width: 100%;
  height: 100%;
}
.kpi-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kpi-item {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  border-left: 1px solid rgba(255,255,255,0.1);
  padding: 16px 20px;
  border-radius: 4px;
  transition: transform 0.3s ease;
}
.kpi-item:hover {
  transform: translateX(4px);
  background: linear-gradient(90deg, rgba(0,216,255,0.05) 0%, transparent 100%);
  border-left-color: var(--el-color-primary);
}
.kpi-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.kpi-value {
  font-size: 32px;
  font-weight: 300;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}
.text-blue { color: var(--el-color-primary); text-shadow: 0 0 10px rgba(0,216,255,0.3); }
.text-green { color: #00ffaa; text-shadow: 0 0 10px rgba(0,255,170,0.3); }
.text-yellow { color: #ffb800; text-shadow: 0 0 10px rgba(255,184,0,0.3); }
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
  background: rgba(255, 255, 255, 0.02);
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}
.alarm-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.alarm-time { width: 65px; color: rgba(255,255,255,0.4); font-size: 12px; font-family: monospace; }
.alarm-level { width: 36px; font-weight: 600; text-align: center; font-size: 12px; border-radius: 4px; padding: 2px 0; margin-right: 12px; }
.alarm-desc { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.HH { background: rgba(255, 51, 102, 0.15); color: #ff3366; border: 1px solid rgba(255, 51, 102, 0.3); }
.H { background: rgba(255, 184, 0, 0.15); color: #ffb800; border: 1px solid rgba(255, 184, 0, 0.3); }
.L { background: rgba(0, 216, 255, 0.15); color: var(--el-color-primary); border: 1px solid rgba(0, 216, 255, 0.3); }
.map-overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  background: rgba(8, 15, 30, 0.8);
  backdrop-filter: blur(10px);
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.stat-item {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
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
.dot.green { background-color: #00ffaa; box-shadow: 0 0 8px #00ffaa; }
.dot.red { background-color: #ff3366; box-shadow: 0 0 8px #ff3366; }
.dot.yellow { background-color: #ffb800; box-shadow: 0 0 8px #ffb800; }
</style>
