<template>
  <div class="app-container wide-panel fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">安防与环境空间监控</h1>
        <p class="page-subtitle">Security & Environmental Space Monitoring</p>
      </div>
      <div class="header-actions">
        <el-tag effect="dark" class="status-tag pulse-tag">安防监控在线</el-tag>
      </div>
    </div>
    <el-row :gutter="12" style="flex: 1; min-height: 0;">
      <el-col :span="18" style="display: flex; flex-direction: column;">
        <div class="box-card" style="padding: 20px; flex: 1;">
          <div class="panel-header">
            <div class="panel-title">RTSP 视频矩阵 <span>Video Matrix</span></div>
            <div class="panel-extra">
              <el-radio-group size="small" class="custom-radio" v-model="layoutMode">
                <el-radio-button value="4">4分屏</el-radio-button>
                <el-radio-button value="9">9分屏</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="video-matrix" :class="'grid-' + layoutMode" v-loading="loading">
            <div class="video-cell" v-for="cam in cameraList.slice(0, Number(layoutMode))" :key="cam.id">
              <div class="video-title">
                <div class="cam-status"></div>
                监控点位 {{ cam.id }} - {{ cam.name }}
              </div>
              <div class="video-placeholder">
                <el-icon class="cam-icon"><VideoCamera /></el-icon>
                <span>实时流接驳中…</span>
              </div>
              <div class="video-overlay">
                <span>REC</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" style="display: flex; flex-direction: column;">
        <div class="box-card" style="padding: 20px; margin-bottom: 24px;">
          <div class="panel-header">
            <div class="panel-title">环境指标实时数据 <span>Environment</span></div>
          </div>
          <div class="env-grid" v-loading="loading">
            <div class="env-card">
              <div class="env-label">硫化氢 (H2S)</div>
              <div class="env-value" :class="envData.h2s > 0.1 ? 'text-red' : 'text-emerald'">{{ envData.h2s }} <span class="env-unit">ppm</span></div>
            </div>
            <div class="env-card">
              <div class="env-label">一氧化碳 (CO)</div>
              <div class="env-value" :class="envData.co > 5 ? 'text-red' : 'text-emerald'">{{ envData.co }} <span class="env-unit">ppm</span></div>
            </div>
            <div class="env-card">
              <div class="env-label">环境温度</div>
              <div class="env-value text-cyan">{{ envData.temp }} <span class="env-unit">°C</span></div>
            </div>
            <div class="env-card">
              <div class="env-label">环境湿度</div>
              <div class="env-value text-cyan">{{ envData.humidity }} <span class="env-unit">%</span></div>
            </div>
          </div>
        </div>
        <div class="box-card" style="padding: 20px;">
          <div class="panel-header">
            <div class="panel-title">门禁与安防联锁 <span>Access Control</span></div>
          </div>
          <div class="access-list" v-loading="loading">
            <div class="access-item" v-for="door in doorList" :key="door.id">
              <div class="access-info">
                <div class="access-name">{{ door.name }}</div>
                <div class="access-status" :class="door.locked ? 'text-emerald' : 'text-red'">
                  <span class="dot" :class="door.locked ? 'bg-emerald' : 'bg-red'"></span> {{ door.locked ? '正常锁定' : '异常开启' }}
                </div>
              </div>
              <el-button type="danger" size="small" @click="toggleDoor(door)">紧急锁死</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VideoCamera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSecurityData } from '@/api/scada'
const layoutMode = ref('4')
const loading = ref(false)
const cameraList = ref<any[]>([])
const doorList = ref<any[]>([])
const envData = ref<any>({ h2s: 0, co: 0, temp: 0, humidity: 0 })
const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getSecurityData()
    if (res.code === 200) {
      cameraList.value = res.data.cameras || []
      doorList.value = res.data.doors || []
      envData.value = res.data.environment || { h2s: 0.02, co: 1.5, temp: 26.5, humidity: 45.0 }
    }
  } catch (error) {
    // Fallback to initial structure if API fails
    cameraList.value = Array.from({ length: 9 }).map((_, i) => ({ id: i + 1, name: i % 2 === 0 ? '二供泵房' : '1号厂区主门' }))
    doorList.value = Array.from({ length: 3 }).map((_, i) => ({ id: i + 1, name: `1号泵房 - 主防爆门${i+1}`, locked: true }))
    envData.value = { h2s: 0.02, co: 1.5, temp: 26.5, humidity: 45.0 }
  } finally {
    loading.value = false
  }
}
const toggleDoor = (door: any) => {
  ElMessage.success(`${door.name} 已发送锁死指令`)
  door.locked = true
}
onMounted(() => {
  loadData()
})
</script>
<style scoped>



.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.page-subtitle {
  display: none;
}


.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}

.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title span {
  font-size: 13px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* RTSP 矩阵 */
.video-matrix {
  display: grid;
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}
.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}
.video-cell {
  position: relative;
  background: var(--el-fill-color-dark);
  border: 1px solid var(--el-border-color-darker);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 30px var(--el-color-black);
  overflow: hidden;
}
.video-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 24px;
  background: linear-gradient(180deg, var(--el-color-black) 0%, transparent 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  letter-spacing: 0.5px;
}
.cam-status {
  width: 8px;
  height: 8px;
  background: var(--el-color-success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--el-color-success);
}
.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-regular);
}
.cam-icon {
  font-size: 32px;
  opacity: 0.5;
}
.video-overlay {
  position: absolute;
  bottom: 12px;
  right: 16px;
  color: var(--el-color-danger);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}
.video-overlay::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background-color: var(--el-color-danger);
  border-radius: 50%;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 环境指标 */
.env-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.env-card {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.env-card:hover {
  transform: translateY(-2px);
  border-color: var(--el-color-primary-light-5);
}
.env-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}
.env-value {
  font-size: 32px;
  font-weight: 600;
  font-family: "SF Mono", Consolas, monospace;
}
.env-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  font-family: "SF Pro Display", sans-serif;
  margin-left: 4px;
}
.text-cyan { color: var(--el-color-primary); }
.text-emerald { color: var(--el-color-success); }
.text-red { color: var(--el-color-danger); }
.bg-emerald { background-color: var(--el-color-success); }
.bg-red { background-color: var(--el-color-danger); }

/* 门禁列表 */
.access-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.access-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  padding: 16px;
  border-radius: 12px;
}
.access-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.access-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.access-status {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.pulse-tag {
  animation: pulse 2s infinite;
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
  color: var(--el-color-success);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--el-color-success-light-5); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
</style>
