<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">综合能效优化与动态成本核算</h1>
        <p class="page-subtitle">Energy Optimization & Dynamic Cost Accounting</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="handleAdd">补录能耗数据</el-button>
      </div>
    </div>

    <div class="info-banner">
      <el-icon class="banner-icon"><InfoFilled /></el-icon>
      <div class="banner-content">
        <div class="banner-title">工业级能效算法说明</div>
        <div class="banner-desc">核心指标：吨水百米能耗指标 (kWh/m3·100m) = (日耗电量 / 日泵水量) × (100 / 设计扬程)。该指标越低，说明泵组运行能效越高。当指标显著偏离基线时，建议安排机电检修。</div>
      </div>
    </div>

    <div class="glass-panel hover-lift" style="padding: 20px;">
      <el-table :data="tableData" style="width: 100%" class="dark-table custom-scrollbar" v-loading="loading" element-loading-background="rgba(15,23,42,0.8)">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="record_date" label="记录日期" width="150" align="center">
          <template #default="scope">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ scope.row.record_date.split('T')[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="device_name" label="耗能设备 (泵组)">
          <template #default="scope">
            <span class="highlight-text">[{{ scope.row.device_code }}]</span>
            <span style="color: #e2e8f0; margin-left: 8px;">{{ scope.row.device_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="power_kwh" label="日耗电量 (kWh)" width="160" align="right">
          <template #default="scope">
            <span style="color: #f59e0b; font-weight: 600; font-family: 'SF Mono', monospace;">{{ scope.row.power_kwh }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="water_pumped_m3" label="日泵水量 (m³)" width="160" align="right">
          <template #default="scope">
            <span style="color: #00d8ff; font-weight: 600; font-family: 'SF Mono', monospace;">{{ scope.row.water_pumped_m3 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="energy_efficiency" label="吨水百米能耗" width="200" align="center">
          <template #default="scope">
            <el-tag :class="scope.row.energy_efficiency > 3.4 ? 'danger-tag' : (scope.row.energy_efficiency > 3.2 ? 'warning-tag' : 'success-tag')" effect="dark" style="border: none;">
              {{ parseFloat(scope.row.energy_efficiency).toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button size="small" class="action-btn text-rose" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="手工补录设备能耗" v-model="dialogVisible" width="480px" @close="resetForm" class="glass-dialog" :show-close="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="dark-form" label-position="left">
        <el-form-item label="耗能设备" prop="device_id">
          <el-select v-model="form.device_id" filterable placeholder="选择泵组" style="width: 100%" class="glass-select" popper-class="glass-dropdown">
            <el-option v-for="item in deviceOptions" :key="item.id" :label="`[${item.device_code}] ${item.device_name}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录日期" prop="record_date">
          <el-date-picker v-model="form.record_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" class="glass-date-picker" popper-class="glass-dropdown" />
        </el-form-item>
        <el-form-item label="日耗电量 (kWh)" prop="power_kwh">
          <el-input-number v-model="form.power_kwh" :min="0" :step="10" style="width: 100%" controls-position="right" class="glass-input-number" />
        </el-form-item>
        <el-form-item label="日泵水量 (m³)" prop="water_pumped_m3">
          <el-input-number v-model="form.water_pumped_m3" :min="0" :step="100" style="width: 100%" controls-position="right" class="glass-input-number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="submitForm">确定录入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  device_id: null,
  record_date: '',
  power_kwh: 0,
  water_pumped_m3: 0
})

const deviceOptions = ref<any[]>([])

const rules = {
  device_id: [{ required: true, message: '必选', trigger: 'change' }],
  record_date: [{ required: true, message: '必填', trigger: 'blur' }],
  power_kwh: [{ required: true, message: '必填', trigger: 'blur' }],
  water_pumped_m3: [{ required: true, message: '必填', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/energy/list')
    tableData.value = res || []
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const fetchOptions = async () => {
  try {
    deviceOptions.value = await request.get('/api/data-center/governance/assets') || []
  } catch (e) {}
}

const handleAdd = () => {
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除该日期的能耗记录吗？`, '警告', { type: 'error' }).then(async () => {
    try {
      await request.delete(`/api/data-center/energy/record/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post('/api/data-center/energy/record', form.value)
        ElMessage.success('能耗数据录入成功，指标已重新核算')
        dialogVisible.value = false
        fetchData()
      } catch (e) {}
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
}

onMounted(() => {
  fetchOptions()
  fetchData()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}
.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(0, 216, 255, 0.05);
  border: 1px solid rgba(0, 216, 255, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.banner-icon {
  font-size: 24px;
  color: #00d8ff;
  margin-top: 2px;
}
.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: #00d8ff;
  margin-bottom: 4px;
}
.banner-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}
.highlight-text {
  color: #00d8ff;
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.danger-tag {
  background-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
  font-family: "SF Mono", monospace;
}
.warning-tag {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  font-family: "SF Mono", monospace;
}
.success-tag {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  font-family: "SF Mono", monospace;
}
.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
  transform: translateY(-1px);
}
.text-rose { color: #f43f5e; }
/* Table styles */
:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}
:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-table-border-color); }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: var(--el-table-row-hover-bg-color) !important; }
:deep(.el-table::before) { display: none; }
.custom-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
}
/* Dialog Styles */
:deep(.glass-dialog) {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
:deep(.dark-form .el-form-item__label) {
  color: #94a3b8;
  font-weight: 500;
}
:deep(.glass-input .el-input__wrapper),
:deep(.glass-input-number .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #e2e8f0;
}
:deep(.glass-input .el-input__wrapper:hover),
:deep(.glass-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}
:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}
:deep(.glass-select .el-input__wrapper),
:deep(.glass-date-picker .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-select .el-input__inner),
:deep(.glass-input .el-input__inner),
:deep(.glass-date-picker .el-input__inner),
:deep(.glass-input-number .el-input__inner) {
  color: #e2e8f0;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
}
:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #00d8ff !important;
}
</style>
