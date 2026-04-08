<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">SCADA 报警联锁与因果矩阵引擎</div>
          <el-button type="primary" size="default">新增联锁策略</el-button>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="24">
          <div class="table-container">
            <el-table :data="matrix" style="width: 100%">
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
              <el-table-column prop="delay" label="延迟执行 (秒)" width="120" align="center">
                <template #default="{ row }">
                  <el-tag size="small" type="info" effect="plain">{{ row.delay }}s</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="策略状态" width="100" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.status" :disabled="row.bypass" />
                </template>
              </el-table-column>
              <el-table-column label="高级运维" width="180" align="center">
                <template #default="{ row }">
                  <el-button 
                    :type="row.bypass ? 'danger' : 'default'" 
                    size="small" 
                    :plain="!row.bypass" 
                    @click="toggleBypass(row)"
                  >
                    {{ row.bypass ? '解除旁路 (Bypass)' : '开启强制旁路' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-card>
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
    ElMessageBox.confirm('开启 Bypass 将跳过自动化联锁保护，仅限维修期使用。此操作将记入高级审计库，是否继续？', '危险权限', { type: 'error' }).then(() => {
      row.bypass = true; ElMessage.warning('旁路已激活')
    })
  } else {
    row.bypass = false; ElMessage.success('旁路已解除，自动联锁恢复')
  }
}
</script>
<style scoped>
.page-container {
  padding: 24px;
  background: #f4f6f8;
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.table-container {
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
}

:deep(.el-table th.el-table__cell) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

.logic-text {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  word-break: break-all;
}

.cause-text {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.effect-text {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.link-icon {
  font-size: 16px;
  color: #909399;
  vertical-align: middle;
}
</style>
