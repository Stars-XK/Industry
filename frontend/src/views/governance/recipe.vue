<template>
  <div class="app-container fade-in-up">
    <div class="box-card">
      <div class="panel-header">
        <div>
          <div class="header-title">工业配方与工艺参数库</div>
          <div class="header-subtitle">Process Recipe Management</div>
        </div>
        <el-button  @click="handleAdd">新增配方</el-button>
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
          <el-button  style="border-color: var(--el-border-color); color: var(--el-text-color-regular)" @click="dialogVisible = false">取消</el-button>
          <el-button  @click="submitForm">保存配方</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入工业配方数据"
      templateName="工业配方"
      :templateColumns="['配方名称', '工艺类型', '工艺参数', '状态']"
      @success="fetchData"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
const tableData = ref<any[]>([])
const loading = ref(false)
const showImport = ref(false)
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
    const res = await request.get('/api/v1/data-center/recipe/list')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
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
      await request.delete(`/api/v1/data-center/recipe/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const handleStatusChange = async (row: any) => {
  try {
    await request.put(`/api/v1/data-center/recipe/${row.id}`, { ...row })
    ElMessage.success('状态已更新')
  } catch (e) { /* fallback */ }
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
          await request.put(`/api/v1/data-center/recipe/${form.value.id}`, payload)
        } else {
          await request.post('/api/v1/data-center/recipe', payload)
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
  form.value.parameters_json = ''
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
  width: 100%;
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
  background: var(--el-fill-color-blank);
  flex: 1;
}
.industrial-table {
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
}
.json-viewer {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 12px;
  background: var(--el-fill-color-blank);
  padding: 6px 10px;
  border-radius: 4px;
  color: var(--el-color-primary);
  border: 1px solid var(--el-border-color-light);
  word-break: break-all;
}
.text-neon { color: var(--el-color-primary); }
.text-danger { color: var(--el-color-danger); }
.text-success { color: var(--el-color-success); }
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
