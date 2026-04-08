<template>
  <div class="premium-container fade-in-up">
    <div class="glass-panel hover-lift">
      <div class="panel-header">
        <div class="header-title">数据清洗与传感器健康度评估</div>
        <div class="header-subtitle">Data Quality & Sensor Health Monitoring</div>
      </div>
      <el-row :gutter="24" class="content-row">
        <el-col :span="12">
          <div class="industrial-section">
            <div class="section-title">传感器死值/毛刺过滤规则 (数据中台)</div>
            <div class="section-content">
              <el-form label-width="180px" class="industrial-form">
                <el-form-item label="启用毛刺过滤 (Spike)">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-switch v-model="rule.spike_filter" class="industrial-switch" />
                    <span class="form-tip">(剔除单秒跳变 > 200% 的极大值)</span>
                  </div>
                </el-form-item>
                <el-form-item label="最大物理流速上限">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input-number v-model="rule.max_velocity" :min="1" class="industrial-input-number" />
                    <span style="color: #e2e8f0; margin-left: 8px;">m/s</span>
                    <span class="form-tip">(超过管道最大流速的数据直接抛弃)</span>
                  </div>
                </el-form-item>
                <el-form-item label="死值判定 (Deadband)">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input-number v-model="rule.dead_time_hours" :min="1" class="industrial-input-number" />
                    <span style="color: #e2e8f0; margin-left: 8px;">小时内读数绝对不变，则判定为“传感器卡死”</span>
                  </div>
                </el-form-item>
                <el-form-item style="margin-top: 32px;">
                  <el-button class="neon-btn">下发清洗规则</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="industrial-section">
            <div class="section-title">传感器寿命预警看板</div>
            <div class="table-container">
              <el-table :data="sensors" style="width: 100%" class="industrial-table">
                <el-table-column prop="name" label="传感器测点" min-width="150" />
                <el-table-column prop="online" label="本周在线率" width="100" align="center">
                  <template #default="{ row }">
                    <span :class="row.online < 90 ? 'text-danger' : 'text-success'">{{ row.online }}%</span>
                  </template>
                </el-table-column>
                <el-table-column prop="battery" label="电池剩余电量" min-width="150">
                  <template #default="{ row }">
                    <el-progress :percentage="row.battery" :color="row.battery < 20 ? '#F56C6C' : '#00d8ff'" class="industrial-progress" />
                  </template>
                </el-table-column>
                <el-table-column prop="life" label="预计寿命" width="100" align="center">
                  <template #default="{ row }">
                    <span :class="row.battery < 20 ? 'text-danger' : ''">{{ row.life }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const rule = ref({ spike_filter: true, max_velocity: 5.5, dead_time_hours: 12 })
const sensors = ref([
  { name: 'S-DN300-主干网压力', online: 99.8, battery: 85, life: '3年' },
  { name: 'F-NB-A区电磁水表', online: 92.1, battery: 45, life: '1.5年' },
  { name: 'F-NB-B区地下水表', online: 78.5, battery: 12, life: '即将耗尽' }
])
</script>
<style scoped>
.panel-header {
  display: flex;
  flex-direction: column;
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
.table-container {
  flex: 1;
}
.industrial-table {
  background: transparent !important;
  --el-table-border-color: rgba(148, 163, 184, 0.05);
  --el-table-header-bg-color: rgba(15, 23, 42, 0.6);
  --el-table-header-text-color: #cbd5e1;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(30, 41, 59, 0.5);
  --el-table-text-color: #94a3b8;
}
:deep(.el-table th.el-table__cell) {
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
}
.form-tip {
  color: #94a3b8;
  margin-left: 12px;
  font-size: 13px;
}
.text-danger {
  color: #F56C6C;
  text-shadow: 0 0 10px rgba(245, 108, 108, 0.3);
  font-weight: 600;
}
.text-success {
  color: #00d8ff;
  font-weight: 600;
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
:deep(.el-switch__core) {
  background-color: rgba(148, 163, 184, 0.2) !important;
  border-color: rgba(148, 163, 184, 0.2) !important;
}
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #00d8ff !important;
  border-color: #00d8ff !important;
  box-shadow: 0 0 10px rgba(0, 216, 255, 0.4);
}
:deep(.el-progress-bar__outer) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.1);
}
:deep(.el-progress__text) {
  color: #e2e8f0 !important;
}
</style>
