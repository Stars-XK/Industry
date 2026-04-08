<template>
  <div class="premium-container">
    <div class="glass-panel">
      <div class="panel-header">
        <div class="header-title">累积量换算与插值容错规则配置</div>
        <div class="header-subtitle">Data Interpolation & Error Tolerance Rules</div>
      </div>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="table-container">
            <el-table :data="rules" style="width: 100%" class="industrial-table">
              <el-table-column prop="rule_name" label="设备类型/场景" />
              <el-table-column prop="interp_method" label="插值补偿算法">
                <template #default="{ row }">
                  <el-select v-model="row.interp_method" size="small" class="industrial-select">
                    <el-option label="PCHIP (三次埃尔米特)" value="pchip" />
                    <el-option label="Linear (线性插值)" value="linear" />
                    <el-option label="Prev (前值填补)" value="prev" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="max_gap_hours" label="允许最大断点时长(小时)" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.max_gap_hours" size="small" :min="1" class="industrial-input-number" />
                </template>
              </el-table-column>
              <el-table-column prop="is_negative_allow" label="允许负流量倒转" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.is_negative_allow" class="industrial-switch" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button class="neon-btn" size="small">保存策略</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const rules = ref([
  { rule_name: '主干管超声波流量计', interp_method: 'pchip', max_gap_hours: 4, is_negative_allow: false },
  { rule_name: '小区电磁水表', interp_method: 'linear', max_gap_hours: 12, is_negative_allow: true },
  { rule_name: '管网压力计', interp_method: 'prev', max_gap_hours: 1, is_negative_allow: false }
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
.table-container {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.3);
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
:deep(.el-switch__core) {
  background-color: rgba(148, 163, 184, 0.2) !important;
  border-color: rgba(148, 163, 184, 0.2) !important;
}
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #00d8ff !important;
  border-color: #00d8ff !important;
  box-shadow: 0 0 10px rgba(0, 216, 255, 0.4);
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
</style>
