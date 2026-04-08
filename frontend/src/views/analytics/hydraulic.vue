<template>
  <div class="premium-container">
    <div class="glass-panel">
      <div class="panel-header">
        <div>
          <div class="header-title">在线水力模型仿真与推演 (EPANET)</div>
          <div class="header-subtitle">Hydraulic Modeling & Simulation Sandbox</div>
        </div>
      </div>
      <el-row :gutter="24" class="content-row">
        <el-col :span="6">
          <div class="industrial-section">
            <div class="section-title">What-If 沙盘推演</div>
            <div class="section-content">
              <el-form label-position="top" class="industrial-form">
                <el-form-item label="选择推演场景">
                  <el-select v-model="scenario" class="industrial-select" style="width: 100%">
                    <el-option label="模拟 V-05 阀门关闭检修" value="close_v05" />
                    <el-option label="模拟 1号泵房停电" value="pump_down" />
                    <el-option label="模拟 D300 主管爆管泄露" value="pipe_burst" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button class="neon-btn" style="width: 100%">开始底层流场平差推演</el-button>
                </el-form-item>
              </el-form>
              
              <div class="result-panel">
                <div class="result-header">推演结果影响面评估</div>
                <div class="result-metric">
                  <span class="label">受影响车间/小区:</span>
                  <span class="value text-danger">3 个</span>
                </div>
                <div class="result-metric">
                  <span class="label">压力不足节点:</span>
                  <span class="value text-warning">12 个</span>
                </div>
                <div class="result-metric">
                  <span class="label">最大水压降幅:</span>
                  <span class="value text-neon">0.15 MPa</span>
                </div>
                <el-button class="neon-btn neon-btn-warning" style="width: 100%; margin-top: 16px">将此场景一键转抢修 SOP</el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="map-placeholder">
            <div class="map-grid"></div>
            <div class="map-content">
              <el-icon class="map-icon"><Position /></el-icon>
              <p>GIS 水压等值线云图渲染区 (WebMap Engine)</p>
              <span class="map-desc">等待 EPANET 引擎返回推演计算结果...</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Position } from '@element-plus/icons-vue'
const scenario = ref('close_v05')
</script>
<style scoped>
.premium-container {
  padding: 24px;
  background: radial-gradient(circle at 50% 0%, #0a192f 0%, #020617 100%);
  min-height: calc(100vh - 60px);
  color: #e2e8f0;
  font-family: "SF Pro Display", -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
}

.glass-panel {
  background: rgba(10, 25, 47, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

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

.content-row {
  flex: 1;
}

.industrial-section {
  background: rgba(2, 6, 23, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.05);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  background: rgba(15, 23, 42, 0.6);
  letter-spacing: 0.5px;
}

.section-content {
  padding: 24px;
  flex: 1;
}

.industrial-form :deep(.el-form-item__label) {
  color: #cbd5e1;
  font-weight: 500;
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

.neon-btn {
  background: transparent;
  border: 1px solid rgba(0, 216, 255, 0.5);
  color: #00d8ff;
  transition: all 0.3s ease;
  font-family: "SF Pro Display", sans-serif;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  letter-spacing: 1px;
}

.neon-btn:hover {
  background: rgba(0, 216, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 216, 255, 0.3);
  border-color: #00d8ff;
}

.neon-btn-warning {
  border-color: rgba(230, 162, 60, 0.5);
  color: #E6A23C;
}

.neon-btn-warning:hover {
  background: rgba(230, 162, 60, 0.1);
  box-shadow: 0 0 15px rgba(230, 162, 60, 0.3);
  border-color: #E6A23C;
}

.result-panel {
  margin-top: 32px;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-left: 4px solid #00d8ff;
}

.result-header {
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.result-metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-family: "SF Mono", Consolas, monospace;
  font-size: 13px;
}

.result-metric .label {
  color: #94a3b8;
}

.result-metric .value {
  font-weight: 600;
}

.text-danger { color: #F56C6C; text-shadow: 0 0 10px rgba(245, 108, 108, 0.3); }
.text-warning { color: #E6A23C; }
.text-neon { color: #00d8ff; }

.map-placeholder {
  background: rgba(2, 6, 23, 0.6);
  height: 100%;
  min-height: 500px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 216, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 216, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 1;
}

.map-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.map-icon {
  font-size: 48px;
  color: rgba(0, 216, 255, 0.5);
  margin-bottom: 16px;
}

.map-content p {
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0 0 8px 0;
}

.map-desc {
  color: #94a3b8;
  font-size: 13px;
  font-family: "SF Mono", Consolas, monospace;
}
</style>
