<template>
  <div class="app-container fade-in-up">
    <div class="box-card">
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
                  <el-button  size="small">保存策略</el-button>
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
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}
.box-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);

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
.table-container {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}
.industrial-table {
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
}
</style>
