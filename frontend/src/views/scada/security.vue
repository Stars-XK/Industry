<template>
  <div class="premium-container">
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
        <div class="glass-panel" style="padding: 20px; height: calc(100vh - 160px);">
          <div class="panel-header">
            <div class="panel-title">RTSP 视频矩阵 <span>Video Matrix</span></div>
            <div class="panel-extra">
              <el-radio-group size="small" class="custom-radio" v-model="layoutMode">
                <el-radio-button label="4">4分屏</el-radio-button>
                <el-radio-button label="9">9分屏</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="video-matrix" :class="'grid-' + layoutMode">
            <div class="video-cell" v-for="i in Number(layoutMode)" :key="i">
              <div class="video-title">
                <div class="cam-status"></div>
                监控点位 {{ i }} - {{ i % 2 === 0 ? '二供泵房' : '1号厂区主门' }}
              </div>
              <div class="video-placeholder">
                <el-icon class="cam-icon"><VideoCamera /></el-icon>
                <span>实时流接驳中...</span>
              </div>
              <div class="video-overlay">
                <span>REC</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="8">
        <div class="glass-panel" style="padding: 20px; margin-bottom: 24px;">
          <div class="panel-header">
            <div class="panel-title">环境指标实时数据 <span>Environment</span></div>
          </div>
          <div class="env-grid">
            <div class="env-card">
              <div class="env-label">硫化氢 (H2S)</div>
              <div class="env-value text-emerald">0.02 <span class="env-unit">ppm</span></div>
            </div>
            <div class="env-card">
              <div class="env-label">一氧化碳 (CO)</div>
              <div class="env-value text-emerald">1.5 <span class="env-unit">ppm</span></div>
            </div>
            <div class="env-card">
              <div class="env-label">环境温度</div>
              <div class="env-value text-cyan">26.5 <span class="env-unit">°C</span></div>
            </div>
            <div class="env-card">
              <div class="env-label">环境湿度</div>
              <div class="env-value text-cyan">45.0 <span class="env-unit">%</span></div>
            </div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px;">
          <div class="panel-header">
            <div class="panel-title">门禁与安防联锁 <span>Access Control</span></div>
          </div>
          <div class="access-list">
            <div class="access-item" v-for="i in 3" :key="i">
              <div class="access-info">
                <div class="access-name">1号泵房 - 主防爆门</div>
                <div class="access-status text-emerald">
                  <span class="dot bg-emerald"></span> 正常锁定
                </div>
              </div>
              <el-button class="danger-neon-btn" size="small">紧急锁死</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { VideoCamera } from '@element-plus/icons-vue'

const layoutMode = ref('4')
</script>
<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
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
  color: #e2e8f0;
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
  color: rgba(255, 255, 255, 0.9);
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
  background-color: #10b981;
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
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.env-label {
  font-size: 13px;
  color: #94a3b8;
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
.text-emerald { color: #10b981; }
.text-cyan { color: #00d8ff; }
.bg-emerald { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
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
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}
.access-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.access-name {
  font-size: 14px;
  color: #e2e8f0;
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
.danger-neon-btn {
  background: transparent;
  border: 1px solid #f43f5e;
  color: #f43f5e;
  transition: all 0.3s;
}
.danger-neon-btn:hover {
  background: rgba(244, 63, 94, 0.1);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  color: #fff;
}
:deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left-color: rgba(255, 255, 255, 0.1);
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #00d8ff;
  border-color: #00d8ff;
  color: #020617;
  box-shadow: 0 0 10px rgba(0, 216, 255, 0.3);
}
</style>
