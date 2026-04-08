<template>
  <div class="premium-container">
    <div class="glass-panel">
      <div class="panel-header">
        <div>
          <div class="header-title">阶梯水价与营收费率配置</div>
          <div class="header-subtitle">Tariff & Pricing Configuration</div>
        </div>
        <el-button class="neon-btn" @click="handleAdd">新增费率</el-button>
      </div>

      <div class="table-container">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" class="industrial-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="tariff_code" label="费率编码" width="180">
            <template #default="scope">
              <span class="logic-text">{{ scope.row.tariff_code }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tariff_name" label="费率名称" width="200" />
          <el-table-column prop="price_per_m3" label="单价 (元/m³)" width="150" align="right">
            <template #default="scope">
              <span class="money-text">￥{{ scope.row.price_per_m3 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="适用说明" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" class="industrial-switch" />
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="resetForm" custom-class="industrial-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="industrial-form">
        <el-form-item label="费率编码" prop="tariff_code">
          <el-input v-model="form.tariff_code" :disabled="!!form.id" placeholder="如 T_NEW" />
        </el-form-item>
        <el-form-item label="费率名称" prop="tariff_name">
          <el-input v-model="form.tariff_name" placeholder="如 新工业用水" />
        </el-form-item>
        <el-form-item label="单价(元/m³)" prop="price_per_m3">
          <el-input-number v-model="form.price_per_m3" :precision="4" :step="0.1" :min="0" style="width: 100%" class="industrial-input-number" />
        </el-form-item>
        <el-form-item label="适用说明" prop="description">
          <el-input type="textarea" v-model="form.description" :rows="3" class="industrial-textarea" />
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
const dialogTitle = ref('新增费率')
const formRef = ref()
const form = ref({
  id: '',
  tariff_code: '',
  tariff_name: '',
  price_per_m3: 0,
  description: '',
  status: 1
})

const rules = {
  tariff_code: [{ required: true, message: '必填', trigger: 'blur' }],
  tariff_name: [{ required: true, message: '必填', trigger: 'blur' }],
  price_per_m3: [{ required: true, message: '必填', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/billing/tariffs')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增费率'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑费率'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleStatusChange = async (row: any) => {
  try {
    await request.put(`/api/data-center/billing/tariffs/${row.id}`, row)
    ElMessage.success('状态已更新')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1 // revert
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该费率配置吗？如果已有企业档案绑定将无法删除。', '高危操作确认', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/billing/tariffs/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {
      // 错误由拦截器处理
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/data-center/billing/tariffs/${form.value.id}`, form.value)
        } else {
          await request.post('/api/data-center/billing/tariffs', form.value)
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
}

onMounted(() => {
  fetchData()
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
.money-text {
  font-family: "SF Mono", Consolas, monospace;
  font-weight: 600;
  color: #00d8ff;
  text-shadow: 0 0 10px rgba(0, 216, 255, 0.3);
}
.text-neon { color: #00d8ff; }
.text-danger { color: #F56C6C; }
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
:deep(.el-switch__core) {
  background-color: rgba(148, 163, 184, 0.2) !important;
  border-color: rgba(148, 163, 184, 0.2) !important;
}
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #00d8ff !important;
  border-color: #00d8ff !important;
  box-shadow: 0 0 10px rgba(0, 216, 255, 0.4);
}
:deep(.el-textarea__inner) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #e2e8f0 !important;
  font-family: "SF Mono", Consolas, monospace;
}
:deep(.el-textarea__inner:focus) {
  border-color: #00d8ff !important;
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.2) !important;
}
</style>
