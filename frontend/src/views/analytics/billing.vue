<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">营收计费与出账对账管理</h1>
        <p class="page-subtitle">Billing & Reconciliation Management</p>
      </div>
      <div class="header-actions">
        <el-button type="success" plain @click="handleInputReading">录入抄表底度</el-button>
        <el-button type="primary" @click="handleGenerate">根据抄表生成新账单</el-button>
      </div>
    </div>
    <div class="box-card">
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" class="industrial-table">
          <el-table-column prop="id" label="账单编号" width="100"  show-overflow-tooltip />
          <el-table-column prop="account_no" label="大用户号" width="150"  show-overflow-tooltip />
          <el-table-column prop="account_name" label="用户名称"  show-overflow-tooltip  />
          <el-table-column prop="billing_period" label="账期" width="120" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="logic-text">{{ row.billing_period }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="usage_m3" label="核算用水量(m³)" width="150" align="right" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="value-text">{{ row.usage_m3 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tariff_name" label="适用费率" width="150" align="center"  show-overflow-tooltip />
          <el-table-column prop="total_amount" label="总金额 (元)" width="150" align="right" show-overflow-tooltip>
            <template #default="scope">
              <span class="money-text">￥{{ scope.row.total_amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-tag :type="scope.row.status === 'paid' ? 'success' : 'danger'" effect="dark" class="industrial-tag">
                {{ scope.row.status === 'paid' ? '已缴费' : '未缴费' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-button 
                v-if="scope.row.status === 'unpaid'" 
                size="small" 
                class=" -success" 
                @click="handlePay(scope.row)">
                确认销账
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="手工录入/补录大户抄表底度" v-model="dialogVisible" width="450px" @close="resetForm" custom-class="industrial-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="industrial-form">
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
          <el-button  style="border-color: var(--el-border-color); color: var(--el-text-color-regular)" @click="dialogVisible = false">取消</el-button>
          <el-button  @click="submitForm">保存底度</el-button>
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
    const res = await request.get('/api/v1/data-center/billing/records')
    tableData.value = res || []
    const accRes = await request.get('/api/v1/data-center/billing/accounts')
    accountList.value = (accRes || []).filter((a: any) => a.meter_device_id)
  } catch (e) { /* fallback */ } finally {
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
        await request.post('/api/v1/data-center/billing/records/meter-reading', form.value)
        ElMessage.success('抄表底度保存成功，可据此生成账单')
        dialogVisible.value = false
      } catch (e) { /* fallback */ }
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
    inputErrorMessage: '格式不正确，需为 YYYY-MM',
    customClass: 'industrial-msg-box'
  }).then(async ({ value }) => {
    try {
      const res: any = await request.post('/api/v1/data-center/billing/records/generate', { period: value })
      if (res.errors && res.errors.length > 0) {
        ElMessageBox.alert(res.errors.join('<br/>'), '部分账单生成失败(缺乏底度)', { dangerouslyUseHTMLString: true, type: 'warning', customClass: 'industrial-msg-box' })
      } else {
        ElMessage.success(res.message || '生成成功')
      }
      fetchData()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const handlePay = async (row: any) => {
  try {
    await request.put(`/api/v1/data-center/billing/records/${row.id}/pay`)
    ElMessage.success('销账成功')
    fetchData()
  } catch (e) { /* fallback */ }
}
onMounted(() => {
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

.table-container {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
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
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
}

.value-text {
  font-family: "SF Mono", Consolas, monospace;
  font-weight: 600;
  color: var(--el-color-primary);
}

.money-text {
  font-family: "SF Mono", Consolas, monospace;
  font-weight: 600;
  color: var(--el-color-danger);
}

.industrial-tag { border: none; }
</style>
