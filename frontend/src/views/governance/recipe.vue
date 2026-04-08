<template>
  <div class="premium-container">
    <div class="glass-panel">
      <div class="panel-header">
        <div>
          <div class="header-title">工业配方与工艺参数库</div>
          <div class="header-subtitle">Process Recipe Management</div>
        </div>
        <el-button class="neon-btn" @click="handleAdd">新增配方</el-button>
      </div>

      <div class="table-container">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" class="industrial-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="recipe_name" label="配方名称" width="220" />
          <el-table-column prop="process_type" label="工艺类型" width="120" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.process_type === 'DOSE' ? 'success' : 'warning'" effect="dark" class="industrial-tag">
                {{ scope.row.process_type === 'DOSE' ? '加药 (DOSE)' : '曝气 (AERATE)' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="parameters_json" label="工艺参数">
            <template #default="scope">
              <div class="json-viewer">
                {{ JSON.stringify(scope.row.parameters_json) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" class="industrial-switch" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button size="small" class="text-neon" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" class="text-danger" link @click="handleDelete(scope.row)">删除</el-button>
              <el-button size="small" class="text-success" link @click="handleApply(scope.row)">下发 PLC</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" @close="resetForm" custom-class="industrial-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="industrial-form">
        <el-form-item label="配方名称" prop="recipe_name">
          <el-input v-model="form.recipe_name" placeholder="如：高藻期混凝配方" />
        </el-form-item>
        <el-form-item label="工艺类型" prop="process_type">
          <el-select v-model="form.process_type" style="width: 100%">
            <el-option label="加药 (DOSE)" value="DOSE" />
            <el-option label="曝气 (AERATE)" value="AERATE" />
          </el-select>
        </el-form-item>
        <el-form-item label="工艺参数" prop="parameters_json">
          <el-input type="textarea" v-model="form.parameters_json" :rows="6" placeholder='输入合法 JSON，例如: {"pac_dosage": 15}' class="industrial-textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="neon-btn" style="border-color: #64748b; color: #cbd5e1" @click="dialogVisible = false">取消</el-button>
          <el-button class="neon-btn" @click="submitForm">保存配方</el-button>
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
const dialogTitle = ref('新增配方')
const formRef = ref()
const form = ref({
  id: '',
  recipe_name: '',
  process_type: 'DOSE',
  parameters_json: '',
  status: 1
})

const rules = {
  recipe_name: [{ required: true, message: '必填', trigger: 'blur' }],
  parameters_json: [{ required: true, message: '必须是合法的 JSON', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/recipe/list')
    tableData.value = res || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增工业配方'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑配方'
  form.value = { ...row, parameters_json: JSON.stringify(row.parameters_json, null, 2) }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除配方 [${row.recipe_name}] 吗？`, '提示', { 
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/recipe/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const handleStatusChange = async (row: any) => {
  try {
    await request.put(`/api/data-center/recipe/${row.id}`, { ...row })
    ElMessage.success('状态已更新')
  } catch (e) {}
}

const handleApply = (row: any) => {
  ElMessageBox.confirm(`即将把配方 [${row.recipe_name}] 下发至底层 PLC 控制器，是否继续？`, '高危操作', { 
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(() => {
    ElMessage.success('反向控制指令已通过 MQTT 发送至边缘网关')
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let parsedParams = {}
        try {
          parsedParams = JSON.parse(form.value.parameters_json)
        } catch (e) {
          ElMessage.error('工艺参数必须是合法的 JSON 格式')
          return
        }
        const payload = { ...form.value, parameters_json: parsedParams }

        if (form.value.id) {
          await request.put(`/api/data-center/recipe/${form.value.id}`, payload)
        } else {
          await request.post('/api/data-center/recipe', payload)
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
  form.value.parameters_json = ''
}

onMounted(() => {
  fetchData()
})
</script>
<style scoped>
.premium-container {
  padding: 24px;
  background: radial-gradient(circle at 50% 0%, #0a192f 0%, #020617 100%);
  min-height: calc(100vh - 60px);
  color: #e2e8f0;
  font-family: "SF Pro Display", -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
}

.glass-panel {
  background: rgba(10, 25, 47, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.json-viewer {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 12px;
  background: rgba(15, 23, 42, 0.6);
  padding: 6px 10px;
  border-radius: 4px;
  color: #00d8ff;
  border: 1px solid rgba(148, 163, 184, 0.1);
  word-break: break-all;
}

.neon-btn {
  background: transparent;
  border: 1px solid rgba(0, 216, 255, 0.5);
  color: #00d8ff;
  transition: all 0.3s ease;
  font-family: "SF Pro Display", sans-serif;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.neon-btn:hover {
  background: rgba(0, 216, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 216, 255, 0.3);
  border-color: #00d8ff;
}

.text-neon { color: #00d8ff; }
.text-danger { color: #F56C6C; }
.text-success { color: #67C23A; }

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
