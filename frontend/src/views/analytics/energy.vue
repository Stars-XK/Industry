<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>综合能效优化与动态成本核算</span>
          <el-button type="primary" @click="handleAdd">补录能耗数据</el-button>
        </div>
      </template>

      <el-alert
        title="工业级能效算法说明"
        type="info"
        description="核心指标：吨水百米能耗指标 (kWh/m3·100m) = (日耗电量 / 日泵水量) × (100 / 设计扬程)。该指标越低，说明泵组运行能效越高。当指标显著偏离基线时，建议安排机电检修。"
        show-icon
        style="margin-bottom: 20px;"
      />

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="record_date" label="记录日期" width="150">
          <template #default="scope">{{ scope.row.record_date.split('T')[0] }}</template>
        </el-table-column>
        <el-table-column prop="device_name" label="耗能设备 (泵组)">
          <template #default="scope">
            <span style="font-weight: bold;">[{{ scope.row.device_code }}] {{ scope.row.device_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="power_kwh" label="日耗电量 (kWh)" width="150" align="right" />
        <el-table-column prop="water_pumped_m3" label="日泵水量 (m³)" width="150" align="right" />
        <el-table-column prop="energy_efficiency" label="吨水百米能耗 (kWh/m³·100m)" width="220" align="right">
          <template #default="scope">
            <el-tag :type="scope.row.energy_efficiency > 3.4 ? 'danger' : (scope.row.energy_efficiency > 3.2 ? 'warning' : 'success')" effect="dark">
              {{ parseFloat(scope.row.energy_efficiency).toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="手工补录设备能耗" v-model="dialogVisible" width="400px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="耗能设备" prop="device_id">
          <el-select v-model="form.device_id" filterable placeholder="选择泵组" style="width: 100%">
            <el-option v-for="item in deviceOptions" :key="item.id" :label="`[${item.device_code}] ${item.device_name}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录日期" prop="record_date">
          <el-date-picker v-model="form.record_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日耗电量 (kWh)" prop="power_kwh">
          <el-input-number v-model="form.power_kwh" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日泵水量 (m³)" prop="water_pumped_m3">
          <el-input-number v-model="form.water_pumped_m3" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定录入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
