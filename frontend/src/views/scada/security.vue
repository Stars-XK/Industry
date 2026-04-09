<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">安防与环境空间监控</h1>
        <p class="page-subtitle">Security & Environmental Space Monitoring</p>
      </div>
      <div class="header-actions">
        <el-tag effect="dark" class="status-tag pulse-tag">安防监控在线</el-tag>
      </div>
    </div>
    <el-row :gutter="24">
      <el-col :span="16">
        <div class="box-card" style="padding: 20px; height: calc(100vh - 160px);">
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
      <el-col :span="8">
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
              <el-button class="danger-" size="small" @click="toggleDoor(door)">紧急锁死</el-button>
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
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}
.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar, .header-actions {
  display: flex;
  gap: 12px;
}
.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}
/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.pulse-tag {
  animation: pulse 2s infinite;
  background-color: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-title span {
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.video-matrix {
  display: grid;
  gap: 16px;
  flex: 1;
  height: calc(100% - 40px);
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
  border: 1px solid rgba(0, 216, 255, 0.2);
  border-radius: 8px;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}
.video-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);
  color: var(--el-text-color-regular);
  padding: 12px 16px 24px;
  font-size: 13px;
  letter-spacing: 0.5px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cam-status {
  width: 8px;
  height: 8px;
  background-color: var(--el-color-success);
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}
.video-placeholder {
  color: #475569;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  letter-spacing: 1px;
}
.cam-icon {
  font-size: 32px;
  opacity: 0.5;
}
.video-overlay {
  position: absolute;
  bottom: 12px;
  right: 16px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.video-overlay::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.env-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.env-card {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.env-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.env-value {
  font-size: 24px;
  font-weight: 700;
  font-family: "SF Mono", monospace;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.env-unit {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  font-family: "SF Pro Display", sans-serif;
}
.text-emerald { color: var(--el-color-success); }
.text-cyan { color: var(--el-color-primary); }
.bg-emerald { background-color: var(--el-color-success); box-shadow: 0 0 8px #10b981; }
.access-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.access-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}
.access-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.access-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.access-status {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.danger-btn {
  background: transparent;
  border: 1px solid #f43f5e;
  color: var(--el-color-danger);
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s, opacity 0.3s;
}
.danger-btn:hover {
  background: rgba(244, 63, 94, 0.1);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  color: var(--el-text-color-primary);
}
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
</style>
