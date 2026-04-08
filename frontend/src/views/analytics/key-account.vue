<template>
  <div class="premium-container fade-in-up">
    <div class="glass-panel hover-lift">
      <div class="panel-header">
        <div>
          <div class="header-title">大用户档案与重点企业画像</div>
          <div class="header-subtitle">Key Account & Enterprise Profile Management</div>
        </div>
        <el-button class="neon-btn" @click="handleAdd">新增档案</el-button>
      </div>

      <div class="table-container">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" class="industrial-table">
          <el-table-column prop="account_no" label="大用户编号" width="150">
            <template #default="{ row }">
              <span class="logic-text">{{ row.account_no }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="account_name" label="企业名称" width="250">
            <template #default="{ row }">
              <span style="font-weight: 600; color: #e2e8f0;">{{ row.account_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="industry_type" label="行业分类" width="150" align="center">
            <template #default="scope">
              <el-tag type="info" effect="dark" class="industrial-tag">{{ scope.row.industry_type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="contact" label="联系人" width="120" />
          <el-table-column prop="phone" label="联系电话" width="150">
            <template #default="{ row }">
              <span class="logic-text" style="color: #94a3b8;">{{ row.phone }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="企业地址" show-overflow-tooltip />
          <el-table-column prop="tariff_name" label="适用费率" width="150" align="center">
            <template #default="scope">
              <el-tooltip :content="`单价: ￥${scope.row.price_per_m3} / m³`" placement="top" effect="dark">
                <el-tag effect="plain" class="industrial-tag-plain">{{ scope.row.tariff_name }}</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="meter_device_name" label="绑定水表" width="180" align="center">
            <template #default="scope">
              <el-tag type="success" effect="dark" class="industrial-tag" v-if="scope.row.meter_device_id">{{ scope.row.meter_device_name || '已绑定' }}</el-tag>
              <el-tag type="info" effect="plain" class="industrial-tag-plain" v-else>未绑定</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button size="small" class="text-neon" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" class="text-danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" @close="resetForm" custom-class="industrial-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="industrial-form">
        <el-form-item label="企业编号" prop="account_no">
          <el-input v-model="form.account_no" :disabled="!!form.id" placeholder="如 KA-2026-0005" />
        </el-form-item>
        <el-form-item label="企业名称" prop="account_name">
          <el-input v-model="form.account_name" placeholder="请输入企业全称" />
        </el-form-item>
        <el-form-item label="行业分类" prop="industry_type">
          <el-select v-model="form.industry_type" placeholder="请选择" style="width: 100%">
            <el-option label="半导体制造" value="半导体制造" />
            <el-option label="汽车制造" value="汽车制造" />
            <el-option label="商业综合体" value="商业综合体" />
            <el-option label="软件及服务" value="软件及服务" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="绑定水表" prop="meter_device_id">
          <el-select v-model="form.meter_device_id" filterable clearable placeholder="请搜索并选择挂载的物理水表" style="width: 100%">
            <el-option
              v-for="item in deviceOptions"
              :key="item.id"
              :label="`[${item.device_code}] ${item.device_name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="适用费率" prop="tariff_id">
          <el-select v-model="form.tariff_id" placeholder="请选择适用费率" style="width: 100%">
            <el-option
              v-for="item in tariffOptions"
              :key="item.id"
              :label="`${item.tariff_name} (￥${item.price_per_m3}/m³)`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" v-if="form.id">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" class="industrial-switch" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="neon-btn" style="border-color: #64748b; color: #cbd5e1" @click="dialogVisible = false">取消</el-button>
          <el-button class="neon-btn" @click="submitForm">确定</el-button>
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
const dialogTitle = ref('新增档案')
const tariffOptions = ref<any[]>([])
const deviceOptions = ref<any[]>([])
const formRef = ref()
const form = ref({
  id: '',
  account_no: '',
  account_name: '',
  contact: '',
  phone: '',
  address: '',
  industry_type: '',
  tariff_id: 1,
  meter_device_id: null,
  status: 1
})

const rules = {
  account_no: [{ required: true, message: '必填', trigger: 'blur' }],
  account_name: [{ required: true, message: '必填', trigger: 'blur' }],
  tariff_id: [{ required: true, message: '必须绑定费率', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/billing/accounts')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchOptions = async () => {
  try {
    // 加载全部有效费率
    const tRes = await request.get('/api/data-center/billing/tariffs')
    tariffOptions.value = (tRes || []).filter((t: any) => t.status === 1)
    
    // 加载全部水表类型的资产设备
    const aRes = await request.get('/api/data-center/governance/assets')
    // device_type: 1 为水表
    deviceOptions.value = (aRes || []).filter((a: any) => a.device_type === 1 && a.status === 1)
  } catch (e) {
    console.error(e)
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增档案'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑档案'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该大用户档案吗？如果已有账单产生将无法硬删除。', '高危操作确认', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/billing/accounts/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {
      // 错误由全局拦截器处理提示
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/data-center/billing/accounts/${form.value.id}`, form.value)
        } else {
          await request.post('/api/data-center/billing/accounts', form.value)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchData()
      } catch (e) {}
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  form.value.id = ''
  form.value.status = 1
}

onMounted(() => {
  fetchData()
  fetchOptions()
})
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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
  flex: 1;
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
  background: rgba(15, 23, 42, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.text-neon { color: #00d8ff; }
.text-danger { color: #F56C6C; }
.industrial-tag {
  border: none;
}
.industrial-tag-plain {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #94a3b8 !important;
}
.industrial-form :deep(.el-form-item__label) {
  color: #cbd5e1;
  font-weight: 500;
}
:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  box-shadow: none !important;
}
:deep(.el-input__inner) {
  color: #e2e8f0 !important;
}
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.3) !important;
  border-color: rgba(148, 163, 184, 0.1) !important;
}
:deep(.el-input.is-disabled .el-input__inner) {
  color: #64748b !important;
}
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #00d8ff !important;
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.2) !important;
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
