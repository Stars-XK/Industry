<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>营收计费与出账对账管理</span>
          <div>
            <el-button type="success" plain @click="handleInputReading">录入抄表底度</el-button>
            <el-button type="primary" @click="handleGenerate">根据抄表生成新账单</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="账单编号" width="100" />
        <el-table-column prop="account_no" label="大用户号" width="150" />
        <el-table-column prop="account_name" label="用户名称" />
        <el-table-column prop="billing_period" label="账期" width="120" />
        <el-table-column prop="usage_m3" label="核算用水量(m³)" width="150" />
        <el-table-column prop="tariff_name" label="适用费率" width="150" />
        <el-table-column prop="total_amount" label="总金额 (元)" width="150">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'paid' ? 'success' : 'danger'">
              {{ scope.row.status === 'paid' ? '已缴费' : '未缴费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'unpaid'" 
              size="small" 
              type="success" 
              @click="handlePay(scope.row)">
              确认销账
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="手工录入/补录大户抄表底度" v-model="dialogVisible" width="450px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="企业用户" prop="account_id">
          <el-select v-model="form.account_id" placeholder="请选择企业" style="width: 100%" @change="onAccountChange">
            <el-option v-for="item in accountList" :key="item.id" :label="item.account_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="物理水表ID" prop="device_id">
          <el-input v-model="form.device_id" disabled placeholder="自动带出关联表计" />
        </el-form-item>
        <el-form-item label="归属账期" prop="period">
          <el-date-picker v-model="form.period" type="month" value-format="YYYY-MM" placeholder="选择账期月份" style="width: 100%" />
        </el-form-item>
        <el-form-item label="当期表底(m³)" prop="value">
          <el-input-number v-model="form.value" :precision="2" :step="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存底度</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const accountList = ref<any[]>([])

const formRef = ref()
const form = ref({
  account_id: '',
  device_id: '',
  period: '',
  value: 0
})

const rules = {
  account_id: [{ required: true, message: '必填', trigger: 'change' }],
  period: [{ required: true, message: '必填', trigger: 'change' }],
  value: [{ required: true, message: '必填', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/billing/records')
    tableData.value = res || []
    
    const accRes = await request.get('/api/data-center/billing/accounts')
    accountList.value = (accRes || []).filter((a: any) => a.meter_device_id)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleInputReading = () => {
  dialogVisible.value = true
}

const onAccountChange = (val: number) => {
  const acc = accountList.value.find(a => a.id === val)
  if (acc) {
    form.value.device_id = acc.meter_device_id
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post('/api/data-center/billing/records/meter-reading', form.value)
        ElMessage.success('抄表底度保存成功，可据此生成账单')
        dialogVisible.value = false
      } catch (e) {}
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  form.value = { account_id: '', device_id: '', period: '', value: 0 }
}

const handleGenerate = () => {
  ElMessageBox.prompt('请输入要生成账单的账期 (如 2026-05)，系统将自动根据该月及上月真实抄表底度相减进行计费', '真实账单生成 (工业计费)', {
    confirmButtonText: '执行出账',
    cancelButtonText: '取消',
    inputPattern: /^\d{4}-\d{2}$/,
    inputErrorMessage: '格式不正确，需为 YYYY-MM'
  }).then(async ({ value }) => {
    try {
      const res: any = await request.post('/api/data-center/billing/records/generate', { period: value })
      if (res.errors && res.errors.length > 0) {
        ElMessageBox.alert(res.errors.join('<br/>'), '部分账单生成失败(缺乏底度)', { dangerouslyUseHTMLString: true, type: 'warning' })
      } else {
        ElMessage.success(res.message || '生成成功')
      }
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const handlePay = async (row: any) => {
  try {
    await request.put(`/api/data-center/billing/records/${row.id}/pay`)
    ElMessage.success('销账成功')
    fetchData()
  } catch (e) {}
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
