<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>SCADA 报警联锁与因果矩阵引擎</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card header="软联锁策略配置表 (Cause & Effect)" shadow="hover">
            <el-table :data="matrix" border>
              <el-table-column prop="cause" label="触发条件 (Cause)" width="300" />
              <el-table-column prop="effect" label="执行动作 (Effect)" />
              <el-table-column prop="delay" label="延迟执行 (秒)" width="120" align="center" />
              <el-table-column prop="status" label="策略状态" width="100" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.status" />
                </template>
              </el-table-column>
              <el-table-column label="高级运维" width="150" align="center">
                <template #default="{ row }">
                  <el-button type="danger" size="small" plain @click="toggleBypass(row)">
                    {{ row.bypass ? '已强制旁路' : '开启旁路 (Bypass)' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
<style scoped>.app-container { padding: 20px; }</style>
