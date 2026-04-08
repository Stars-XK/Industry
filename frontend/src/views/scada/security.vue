<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="clearfix">
          <span>安防与环境空间监控</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="16">
          <div class="video-matrix">
            <div class="video-cell" v-for="i in 4" :key="i">
              <div class="video-title">监控点位 {{ i }} - 1号泵房</div>
              <div class="video-placeholder">视频流 RTSP 接入区</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" header="环境指标实时数据" class="env-card">
            <el-form label-width="120px" label-position="left">
              <el-form-item label="硫化氢 (H2S)">
                <el-tag type="success" size="large">0.02 ppm</el-tag>
              </el-form-item>
              <el-form-item label="一氧化碳 (CO)">
                <el-tag type="success" size="large">1.5 ppm</el-tag>
              </el-form-item>
              <el-form-item label="温度">
                <el-tag type="info" size="large">26.5 °C</el-tag>
              </el-form-item>
              <el-form-item label="门禁状态">
                <el-tag type="success" size="large">正常锁定</el-tag>
                <el-button type="danger" size="small" style="margin-left: 16px;">紧急锁定</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.page-container {
  padding: 24px;
  background: #050a15;
  background-image: radial-gradient(circle at 50% 50%, #0d1a38 0%, #050a15 100%);
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #fff;
}

.box-card {
  background: rgba(8, 15, 30, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 216, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(0, 216, 255, 0.1);
  padding: 16px 24px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 1px;
}

.video-matrix {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.video-cell {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  height: 280px;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.video-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  color: rgba(255, 255, 255, 0.8);
  padding: 12px;
  font-size: 13px;
  letter-spacing: 0.5px;
  z-index: 2;
}

.video-placeholder {
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 14px;
  letter-spacing: 1px;
}

.env-card {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 216, 255, 0.1) !important;
  border-radius: 8px;
}

:deep(.env-card .el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-tag) {
  background-color: rgba(0, 216, 255, 0.1);
  border-color: rgba(0, 216, 255, 0.2);
  color: #00d8ff;
}

:deep(.el-tag--success) {
  background-color: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.2);
  color: #67C23A;
}
</style>
