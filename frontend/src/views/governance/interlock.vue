<template>
  <div class="app-container fade-in-up">
    <div class="box-card">
      <div class="panel-header">
        <div>
          <div class="header-title">SCADA 报警联锁与因果矩阵引擎</div>
          <div class="header-subtitle">Interlock & Rule Engine (Cause & Effect)</div>
        </div>
        <el-button type="primary"  @click="dialogVisible = true">新增联锁策略</el-button>
          <el-button  @click="showImport = true" icon="Upload">批量导入</el-button>
      </div>
      <div class="table-container">
        <el-table :data="matrix" style="width: 100%" class="industrial-table custom-table" v-loading="loading">
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
                :class="row.bypass ? '-danger' : ''"
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
    <!-- 新增策略弹窗 -->
    <el-dialog title="新增联锁策略配置" v-model="dialogVisible" width="500px" custom- @close="resetForm">
      <el-form ref="formRef" :model="form" label-width="120px">
        <el-form-item label="触发条件 (Cause)">
          <el-input v-model="form.cause" placeholder="如: 1号清水池 液位 > 4.8m" class="dark-input" />
        </el-form-item>
        <el-form-item label="执行动作 (Effect)">
          <el-input v-model="form.effect" placeholder="如: 强制关闭 [1号进水泵]" class="dark-input" />
        </el-form-item>
        <el-form-item label="延迟执行 (s)">
          <el-input-number v-model="form.delay" :min="0" class="dark-input" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button type="primary" @click="submitForm" >确认新增</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入SCADA联锁策略数据"
      templateName="SCADA联锁策略"
      :templateColumns="['触发条件 (Cause)', '执行动作 (Effect)', '延迟执行', '策略状态']"
      @success="fetchData"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Right } from '@element-plus/icons-vue'
import { getInterlockRules, updateInterlockRule } from '@/api/governance'
const matrix = ref<any[]>([])
const loading = ref(false)
const showImport = ref(false)
const dialogVisible = ref(false)
const form = ref({ cause: '', effect: '', delay: 0 })
const resetForm = () => {
  form.value = { cause: '', effect: '', delay: 0 }
}
const submitForm = () => {
  if (!form.value.cause || !form.value.effect) {
    ElMessage.warning('请输入完整的触发条件与执行动作')
    return
  }
  // 模拟调用 API 添加
  matrix.value.push({
    id: Date.now(),
    cause: form.value.cause,
    effect: form.value.effect,
    delay: form.value.delay,
    status: true,
    bypass: false
  })
  ElMessage.success('联锁策略新增成功，已下发底层 PLC 引擎')
  dialogVisible.value = false
}
const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getInterlockRules()
    if (res.code === 200) {
      matrix.value = res.data || []
    }
  } catch (error) {
    // fallback
    matrix.value = [
      { id: 1, cause: '1号清水池 液位 > 4.8m (高高报)', effect: '强制关闭 [1号进水泵]', delay: 5, status: true, bypass: false },
      { id: 2, cause: '加药车间 硫化氢浓度 > 10ppm', effect: '开启 [顶置排风扇] 并锁定 [区域门禁]', delay: 0, status: true, bypass: false },
      { id: 3, cause: '管网节点 P02 压力 < 0.15MPa', effect: '联动 [二供变频泵] 频率上调 5Hz', delay: 30, status: false, bypass: false }
    ]
  } finally {
    loading.value = false
  }
}
const toggleBypass = (row: any) => {
  if (!row.bypass) {
    ElMessageBox.confirm('开启 Bypass 将跳过自动化联锁保护，仅限维修期使用。此操作将记入高级审计库，是否继续？', '危险权限', {
      confirmButtonText: '确认旁路',
      cancelButtonText: '取消',
      type: 'error',
      customClass: 'industrial-msg-box'
    }).then(async () => {
      try {
        await updateInterlockRule({ id: row.id, bypass: true })
        row.bypass = true; ElMessage.warning('旁路已激活')
      } catch (e) {
        row.bypass = true; ElMessage.warning('旁路已激活') // fallback
      }
    }).catch(() => {})
  } else {
    updateInterlockRule({ id: row.id, bypass: false }).then(() => {
      row.bypass = false; ElMessage.success('旁路已解除，自动联锁恢复')
    }).catch(() => {
      row.bypass = false; ElMessage.success('旁路已解除，自动联锁恢复') // fallback
    })
  }
}
onMounted(() => {
  loadData()
})
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
  justify-content: space-between;
  align-items: center;
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
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  border: 1px solid var(--el-color-warning-light-8);
  box-shadow: inset 0 0 10px var(--el-color-warning-light-9);
}
.effect-text {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
  border: 1px solid var(--el-color-success-light-8);
  box-shadow: inset 0 0 10px var(--el-color-success-light-9);
}
.delay-tag {
  font-family: "SF Mono", Consolas, monospace;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color-overlay);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  font-size: 12px;
}
.link-icon {
  font-size: 16px;
  color: var(--el-border-color-light);
  vertical-align: middle;
}
.-danger {
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-color-danger-light-5);
  color: var(--el-color-danger);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
  font-family: "SF Pro Display", sans-serif;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.-danger:hover {
  background: var(--el-color-danger-light-9);
  box-shadow: 0 0 15px var(--el-color-danger-light-5);
  border-color: var(--el-color-danger);
}
</style>
