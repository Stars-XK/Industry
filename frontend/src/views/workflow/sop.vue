<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>SOP 应急预案库</span>
          <el-button type="primary" @click="handleAdd">新增预案</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="sop_name" label="预案名称" width="250" />
        <el-table-column prop="alarm_type" label="触发报警类型" width="180">
          <template #default="scope">
            <el-tag type="danger" effect="plain">{{ scope.row.alarm_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="steps_json" label="执行步骤">
          <template #default="scope">
            <el-button size="small" @click="viewSteps(scope.row.steps_json)">查看标准步骤</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="预案名称" prop="sop_name">
          <el-input v-model="form.sop_name" placeholder="如：管道爆裂抢修SOP" />
        </el-form-item>
        <el-form-item label="触发报警类型" prop="alarm_type">
          <el-input v-model="form.alarm_type" placeholder="对应设备的报警类型标识，如 PRESSURE_LOW" />
        </el-form-item>
        <el-form-item label="执行步骤" prop="steps_json">
          <el-input type="textarea" v-model="form.steps_json" :rows="8" placeholder='请填入合法的JSON数组，例如: [{"step":1,"action":"关闭阀门"}]' />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
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
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
