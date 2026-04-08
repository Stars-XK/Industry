<template>
  <div class="premium-container">
    <div class="glass-panel">
      <div class="panel-header">
        <div>
          <div class="header-title">SCADA 报警联锁与因果矩阵引擎</div>
          <div class="header-subtitle">Interlock & Rule Engine (Cause & Effect)</div>
        </div>
        <el-button type="primary" class="neon-btn">新增联锁策略</el-button>
      </div>
      
      <div class="table-container">
        <el-table :data="matrix" style="width: 100%" class="industrial-table">
          <el-table-column prop="cause" label="触发条件 (Cause)" min-width="280">
            <template #default="{ row }">
              <span class="logic-text cause-text">{{ row.cause }}</span>
            </template>
          </el-table-column>
          <el-table-column label="联动" width="60" align="center">
            <template #default>
              <el-icon class="link-icon"><Right /></el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="effect" label="执行动作 (Effect)" min-width="280">
            <template #default="{ row }">
              <span class="logic-text effect-text">{{ row.effect }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="delay" label="延迟执行" width="120" align="center">
            <template #default="{ row }">
              <span class="delay-tag">{{ row.delay }}s</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="策略状态" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.status" :disabled="row.bypass" class="industrial-switch" />
            </template>
          </el-table-column>
          <el-table-column label="高级运维" width="180" align="center">
            <template #default="{ row }">
              <el-button 
                :class="row.bypass ? 'neon-btn-danger' : 'neon-btn'" 
                size="small" 
                @click="toggleBypass(row)"
              >
                {{ row.bypass ? '解除旁路 (Bypass)' : '开启强制旁路' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Right } from '@element-plus/icons-vue'

const matrix = ref([
  { cause: '1号清水池 液位 > 4.8m (高高报)', effect: '强制关闭 [1号进水泵]', delay: 5, status: true, bypass: false },
  { cause: '加药车间 硫化氢浓度 > 10ppm', effect: '开启 [顶置排风扇] 并锁定 [区域门禁]', delay: 0, status: true, bypass: false },
  { cause: '管网节点 P02 压力 < 0.15MPa', effect: '联动 [二供变频泵] 频率上调 5Hz', delay: 30, status: false, bypass: false }
])

const toggleBypass = (row: any) => {
  if (!row.bypass) {
    ElMessageBox.confirm('开启 Bypass 将跳过自动化联锁保护，仅限维修期使用。此操作将记入高级审计库，是否继续？', '危险权限', {
      confirmButtonText: '确认旁路',
      cancelButtonText: '取消',
      type: 'error',
      customClass: 'industrial-msg-box'
    }).then(() => {
      row.bypass = true; ElMessage.warning('旁路已激活')
    })
  } else {
    row.bypass = false; ElMessage.success('旁路已解除，自动联锁恢复')
  }
}
</script>
<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.logic-text {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 4px;
  display: inline-block;
  word-break: break-all;
  letter-spacing: 0.5px;
}
.cause-text {
  background: rgba(230, 162, 60, 0.05);
  color: #E6A23C;
  border: 1px solid rgba(230, 162, 60, 0.2);
  box-shadow: inset 0 0 10px rgba(230, 162, 60, 0.05);
}
.effect-text {
  background: rgba(103, 194, 58, 0.05);
  color: #67C23A;
  border: 1px solid rgba(103, 194, 58, 0.2);
  box-shadow: inset 0 0 10px rgba(103, 194, 58, 0.05);
}
.delay-tag {
  font-family: "SF Mono", Consolas, monospace;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 12px;
}
.link-icon {
  font-size: 16px;
  color: #475569;
  vertical-align: middle;
}
.neon-btn-danger {
  background: transparent;
  border: 1px solid rgba(245, 108, 108, 0.5);
  color: #F56C6C;
  transition: all 0.3s ease;
  font-family: "SF Pro Display", sans-serif;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.neon-btn-danger:hover {
  background: rgba(245, 108, 108, 0.1);
  box-shadow: 0 0 15px rgba(245, 108, 108, 0.3);
  border-color: #F56C6C;
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
</style>
