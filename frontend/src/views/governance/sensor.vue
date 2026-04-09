<template>
  <div class="app-container fade-in-up">
    <div class="box-card">
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
                    <span style="color: var(--el-text-color-primary); margin-left: 8px;">m/s</span>
                    <span class="form-tip">(超过管道最大流速的数据直接抛弃)</span>
                  </div>
                </el-form-item>
                <el-form-item label="死值判定 (Deadband)">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <el-input-number v-model="rule.dead_time_hours" :min="1" class="industrial-input-number" />
                    <span style="color: var(--el-text-color-primary); margin-left: 8px;">小时内读数绝对不变，则判定为“传感器卡死”</span>
                  </div>
                </el-form-item>
                <el-form-item style="margin-top: 32px;">
                  <el-button >下发清洗规则</el-button>
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
                <el-table-column prop="name" label="传感器测点" min-width="150"  show-overflow-tooltip />
                <el-table-column prop="online" label="本周在线率" width="100" align="center" show-overflow-tooltip>
                  <template #default="{ row }">
                    <span :class="row.online < 90 ? 'text-danger' : 'text-success'">{{ row.online }}%</span>
                  </template>
                </el-table-column>
                <el-table-column prop="battery" label="电池剩余电量" min-width="150" show-overflow-tooltip>
                  <template #default="{ row }">
                    <el-progress :percentage="row.battery" :color="row.battery < 20 ? 'var(--el-color-danger)' : 'var(--el-color-primary)'" class="industrial-progress" />
                  </template>
                </el-table-column>
                <el-table-column prop="life" label="预计寿命" width="100" align="center" show-overflow-tooltip>
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
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  flex: 1;
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
.panel-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 16px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}
.header-subtitle {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.content-row {
  flex: 1;
}
.industrial-section {
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
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
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-blank);
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
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
}
.form-tip {
  color: var(--el-text-color-regular);
  margin-left: 12px;
  font-size: 13px;
}
.text-danger {
  color: var(--el-color-danger);
  text-shadow: none;
  font-weight: 600;
}
.text-success {
  color: var(--el-color-primary);
  font-weight: 600;
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
