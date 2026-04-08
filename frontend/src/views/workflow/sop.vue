<template>
  <div class="premium-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">SOP 应急预案库</h1>
        <p class="page-subtitle">Standard Operating Procedures & Emergency Response</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="handleAdd">新增预案</el-button>
      </div>
    </div>

    <div class="glass-panel" style="padding: 20px;">
      <el-table :data="tableData" style="width: 100%" class="dark-table custom-scrollbar" v-loading="loading" element-loading-background="rgba(15,23,42,0.8)">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="sop_name" label="预案名称" min-width="250">
          <template #default="scope">
            <span style="color: #e2e8f0; font-weight: 500;">{{ scope.row.sop_name }}</span>
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
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" style="--el-switch-on-color: #10b981; --el-switch-off-color: #475569;" />
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm" class="glass-dialog" :show-close="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="dark-form" label-position="top">
        <el-form-item label="预案名称" prop="sop_name">
          <el-input v-model="form.sop_name" placeholder="如：管道爆裂抢修SOP" class="glass-input" />
        </el-form-item>
        <el-form-item label="触发报警类型" prop="alarm_type">
          <el-input v-model="form.alarm_type" placeholder="对应设备的报警类型标识，如 PRESSURE_LOW" class="glass-input" />
        </el-form-item>
        <el-form-item label="执行步骤" prop="steps_json">
          <el-input type="textarea" v-model="form.steps_json" :rows="8" placeholder='请填入合法的JSON数组，例如: [{"step":1,"action":"关闭阀门"}]' class="glass-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="submitForm">确定保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import request from '@/utils/request'

const tableData = ref<any[]>([])
const loading = ref(false)

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
    const res = await request.get('/api/workflow/sop/list')
    tableData.value = res || []
  } catch (e) {
  } finally {
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
      await request.delete(`/api/workflow/sop/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const handleStatusChange = async (row: any) => {
  try {
    await request.put(`/api/workflow/sop/${row.id}`, { ...row, steps_json: typeof row.steps_json === 'string' ? JSON.parse(row.steps_json) : row.steps_json })
    ElMessage.success('状态更新成功')
  } catch (e) {}
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
          await request.put(`/api/workflow/sop/${form.value.id}`, payload)
        } else {
          await request.post('/api/workflow/sop', payload)
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
  form.value.steps_json = ''
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.glass-panel {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.danger-tag {
  background-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
  transform: translateY(-1px);
}

.text-cyan { color: #00d8ff; }
.text-rose { color: #f43f5e; }

.neon-btn {
  background: transparent;
  border: 1px solid #00d8ff;
  color: #00d8ff;
  transition: all 0.3s;
}

.neon-btn:hover {
  background: rgba(0, 216, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 216, 255, 0.3);
  color: #fff;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Table styles */
.dark-table {
  background-color: transparent !important;
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-header-bg-color: rgba(255, 255, 255, 0.02);
  --el-table-header-text-color: #94a3b8;
  --el-table-text-color: #e2e8f0;
  --el-table-row-hover-bg-color: rgba(0, 216, 255, 0.05);
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}

:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-table-border-color); }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: var(--el-table-row-hover-bg-color) !important; }
:deep(.el-table::before) { display: none; }

.custom-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}

.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Dialog Styles */
:deep(.glass-dialog) {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

:deep(.glass-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-right: 0;
  padding-bottom: 16px;
}

:deep(.glass-dialog .el-dialog__title) {
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.glass-dialog .el-dialog__body) {
  color: #cbd5e1;
  padding-top: 20px;
}

:deep(.glass-dialog .el-dialog__footer) {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Form Styles */
:deep(.dark-form .el-form-item__label) {
  color: #94a3b8;
  font-weight: 500;
}

:deep(.glass-input .el-input__wrapper),
:deep(.glass-input .el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #e2e8f0;
}

:deep(.glass-input .el-input__wrapper:hover),
:deep(.glass-input .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}

:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}

/* SweetAlert overrides (if any global messagebox pops up, ideally handled in global css, but we can add some local overrides if it supports) */
</style>
