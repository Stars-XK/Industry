<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">SOP 应急预案库</h1>
        <p class="page-subtitle">Standard Operating Procedures & Emergency Response</p>
      </div>
      <div class="header-actions">
        <el-button  @click="handleAdd">新增预案</el-button>
      </div>
    </div>
    <div class="box-card" style="padding: 20px;">
      <el-table :data="tableData" style="width: 100%" class="custom-table custom-scrollbar" v-loading="loading" >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="sop_name" label="预案名称" min-width="250">
          <template #default="scope">
            <span style="color: var(--el-text-color-primary); font-weight: 500;">{{ scope.row.sop_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarm_type" label="触发报警类型" width="200">
          <template #default="scope">
            <el-tag effect="dark" class="danger-tag" style="border: none; font-family: 'SF Mono', monospace;">{{ scope.row.alarm_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="steps_json" label="执行步骤" width="160">
          <template #default="scope">
            <el-button size="small" class="action-btn text-cyan" link @click="viewSteps(scope.row.steps_json)">
              <el-icon style="margin-right: 4px;"><View /></el-icon> 查看执行流
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" style="--el-switch-on-color: var(--el-color-success); --el-switch-off-color: #475569;" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <div class="action-btns" style="justify-content: center;">
              <el-button size="small" class="action-btn text-cyan" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" class="action-btn text-rose" link @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm"  :show-close="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px"  label-position="top">
        <el-form-item label="预案名称" prop="sop_name">
          <el-input v-model="form.sop_name" placeholder="如：管道爆裂抢修SOP"  />
        </el-form-item>
        <el-form-item label="触发报警类型" prop="alarm_type">
          <el-input v-model="form.alarm_type" placeholder="对应设备的报警类型标识，如 PRESSURE_LOW"  />
        </el-form-item>
        <el-form-item label="执行步骤" prop="steps_json">
          <el-input type="textarea" v-model="form.steps_json" :rows="8" placeholder='请填入合法的JSON数组，例如: [{"step":1,"action":"关闭阀门"}]'  />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button  @click="submitForm">确定保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入应急预案数据"
      templateName="应急预案"
      :templateColumns="['预案名称', '触发报警类型', '执行步骤', '状态']"
      @success="fetchData"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import request from '@/utils/request'
const tableData = ref<any[]>([])
const loading = ref(false)
const showImport = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增预案')
const formRef = ref()
const form = ref({
  id: '',
  sop_name: '',
  alarm_type: '',
  steps_json: '',
  status: 1
})
const rules = {
  sop_name: [{ required: true, message: '必填', trigger: 'blur' }],
  alarm_type: [{ required: true, message: '必填', trigger: 'blur' }]
}
const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/workflow/sop/list')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const handleAdd = () => {
  dialogTitle.value = '新增预案'
  dialogVisible.value = true
}
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑预案'
  form.value = { ...row, steps_json: typeof row.steps_json === 'string' ? row.steps_json : JSON.stringify(row.steps_json, null, 2) }
  dialogVisible.value = true
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除 SOP 预案 [${row.sop_name}] 吗？`, '提示', { type: 'warning' }).then(async () => {
    try {
      await request.delete(`/api/v1/workflow/sop/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const handleStatusChange = async (row: any) => {
  try {
    await request.put(`/api/v1/workflow/sop/${row.id}`, { ...row, steps_json: typeof row.steps_json === 'string' ? JSON.parse(row.steps_json) : row.steps_json })
    ElMessage.success('状态更新成功')
  } catch (e) { /* fallback */ }
}
const viewSteps = (jsonStr: any) => {
  const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
  ElMessageBox.alert(`<pre style="text-align: left; font-size: 12px; background: #f4f4f5; padding: 10px; border-radius: 4px;">${JSON.stringify(obj, null, 2)}</pre>`, 'SOP 执行步骤', { dangerouslyUseHTMLString: true })
}
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let parsedSteps = []
        try {
          if (form.value.steps_json) {
            parsedSteps = JSON.parse(form.value.steps_json)
          }
        } catch (e) {
          ElMessage.error('执行步骤必须是合法的 JSON 格式')
          return
        }
        const payload = { ...form.value, steps_json: parsedSteps }
        if (form.value.id) {
          await request.put(`/api/v1/workflow/sop/${form.value.id}`, payload)
        } else {
          await request.post('/api/v1/workflow/sop', payload)
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
  form.value.steps_json = ''
}
onMounted(() => {
  fetchData()
})
</script>
<style scoped>
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}
.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
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
.action-btns {
  display: flex;
  gap: 12px;
}
.text-cyan { color: var(--el-color-primary); }
.text-rose { color: var(--el-color-danger); }
/* Table styles */
/* Dialog Styles */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
/* SweetAlert overrides (if any global messagebox pops up, ideally handled in global css, but we can add some local overrides if it supports) */
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
</style>
