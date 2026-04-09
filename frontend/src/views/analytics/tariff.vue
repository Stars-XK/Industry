<template>
  <div class="app-container fade-in-up">
    <div class="box-card">
      <div class="panel-header">
        <div>
          <div class="header-title">阶梯水价与营收费率配置</div>
          <div class="header-subtitle">Tariff & Pricing Configuration</div>
        </div>
        <el-button  @click="handleAdd">新增费率</el-button>
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
          <el-button  style="border-color: var(--el-border-color); color: var(--el-text-color-regular)" @click="dialogVisible = false">取消</el-button>
          <el-button  @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入费率数据"
      templateName="费率"
      :templateColumns="['费率编码', '费率名称', '单价 (元/m³)', '适用说明', '状态']"
      @success="fetchData"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
const tableData = ref([])
const loading = ref(false)
const showImport = ref(false)
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
    const res = await request.get('/api/v1/data-center/billing/tariffs')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
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
    await request.put(`/api/v1/data-center/billing/tariffs/${row.id}`, row)
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
      await request.delete(`/api/v1/data-center/billing/tariffs/${row.id}`)
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
          await request.put(`/api/v1/data-center/billing/tariffs/${form.value.id}`, form.value)
        } else {
          await request.post('/api/v1/data-center/billing/tariffs', form.value)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchData()
      } catch (e) { /* fallback */ }
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
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  flex: 1;
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
  align-items: flex-end;
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
  flex: 1;
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
  background: var(--el-bg-color-overlay);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}
.money-text {
  font-family: "SF Mono", Consolas, monospace;
  font-weight: 600;
  color: var(--el-color-primary);
  text-shadow: 0 0 10px var(--el-color-primary-light-5);
}
.text-neon { color: var(--el-color-primary); }
.text-danger { color: var(--el-color-danger); }
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
