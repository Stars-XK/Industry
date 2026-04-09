<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">综合能效优化与动态成本核算</h1>
        <p class="page-subtitle">Energy Optimization & Dynamic Cost Accounting</p>
      </div>
      <div class="header-actions">
        <el-button  @click="handleAdd">补录能耗数据</el-button>
      </div>
    </div>
    <div class="info-banner">
      <el-icon class="banner-icon"><InfoFilled /></el-icon>
      <div class="banner-content">
        <div class="banner-title">工业级能效算法说明</div>
        <div class="banner-desc">核心指标：吨水百米能耗指标 (kWh/m3·100m) = (日耗电量 / 日泵水量) × (100 / 设计扬程)。该指标越低，说明泵组运行能效越高。当指标显著偏离基线时，建议安排机电检修。</div>
      </div>
    </div>
    <div class="box-card" style="padding: 20px;">
      <el-table :data="tableData" style="width: 100%" class="custom-table custom-scrollbar" v-loading="loading" >
        <el-table-column prop="id" label="ID" width="80" align="center"  show-overflow-tooltip />
        <el-table-column prop="record_date" label="记录日期" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ scope.row.record_date.split('T')[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="device_name" label="耗能设备 (泵组)" show-overflow-tooltip min-width="120">
          <template #default="scope">
            <span class="highlight-text">[{{ scope.row.device_code }}]</span>
            <span style="color: var(--el-text-color-primary); margin-left: 8px;">{{ scope.row.device_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="power_kwh" label="日耗电量 (kWh)" width="160" align="right" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-color-warning); font-weight: 600; font-family: 'SF Mono', monospace;">{{ scope.row.power_kwh }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="water_pumped_m3" label="日泵水量 (m³)" width="160" align="right" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-color-primary); font-weight: 600; font-family: 'SF Mono', monospace;">{{ scope.row.water_pumped_m3 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="energy_efficiency" label="吨水百米能耗" width="200" align="center" show-overflow-tooltip>
          <template #default="scope">
            <el-tag :class="scope.row.energy_efficiency > 3.4 ? 'danger-tag' : (scope.row.energy_efficiency > 3.2 ? 'warning-tag' : 'success-tag')" effect="dark" style="border: none;">
              {{ parseFloat(scope.row.energy_efficiency).toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <el-button size="small" class="action-btn text-rose" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="手工补录设备能耗" v-model="dialogVisible" width="480px" @close="resetForm"  :show-close="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px"  label-position="left">
        <el-form-item label="耗能设备" prop="device_id">
          <el-select v-model="form.device_id" filterable placeholder="选择泵组" style="width: 100%"  popper-class="glass-dropdown">
            <el-option v-for="item in deviceOptions" :key="item.id" :label="`[${item.device_code}] ${item.device_name}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录日期" prop="record_date">
          <el-date-picker v-model="form.record_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" class="glass-date-picker" popper-class="glass-dropdown" />
        </el-form-item>
        <el-form-item label="日耗电量 (kWh)" prop="power_kwh">
          <el-input-number v-model="form.power_kwh" :min="0" :step="10" style="width: 100%" controls-position="right" class="-number" />
        </el-form-item>
        <el-form-item label="日泵水量 (m³)" prop="water_pumped_m3">
          <el-input-number v-model="form.water_pumped_m3" :min="0" :step="100" style="width: 100%" controls-position="right" class="-number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button  @click="submitForm">确定录入</el-button>
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
    const res = await request.get('/api/v1/data-center/energy/list')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const fetchOptions = async () => {
  try {
    deviceOptions.value = await request.get('/api/v1/data-center/governance/assets') || []
  } catch (e) { /* fallback */ }
}
const handleAdd = () => {
  dialogVisible.value = true
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除该日期的能耗记录吗？`, '警告', { type: 'error' }).then(async () => {
    try {
      await request.delete(`/api/v1/data-center/energy/record/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post('/api/v1/data-center/energy/record', form.value)
        ElMessage.success('能耗数据录入成功，指标已重新核算')
        dialogVisible.value = false
        fetchData()
      } catch (e) { /* fallback */ }
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
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin: 0;
  letter-spacing: 0.5px;
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

.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 32px;
}
.banner-icon {
  font-size: 28px;
  color: var(--el-color-primary);
  margin-top: 2px;
}
.banner-content {
  flex: 1;
}
.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 6px;
}
.banner-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.highlight-text {
  color: var(--el-color-primary);
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.text-rose { color: var(--el-color-danger); }
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.custom-table {
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  overflow: hidden;
}

.success-tag { background-color: var(--el-color-success-light-9); color: var(--el-color-success); font-weight: bold; }
.warning-tag { background-color: var(--el-color-warning-light-9); color: var(--el-color-warning); font-weight: bold; }
.danger-tag { background-color: var(--el-color-danger-light-9); color: var(--el-color-danger); font-weight: bold; }
</style>
