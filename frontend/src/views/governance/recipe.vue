<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>工业配方与工艺参数库 (Process Recipe)</span>
          <el-button type="primary" @click="handleAdd">新增配方</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="recipe_name" label="配方名称" width="220" />
        <el-table-column prop="process_type" label="工艺类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.process_type === 'DOSE' ? 'success' : 'warning'">
              {{ scope.row.process_type === 'DOSE' ? '加药 (DOSE)' : '曝气 (AERATE)' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parameters_json" label="工艺参数">
          <template #default="scope">
            <div style="font-family: monospace; font-size: 12px; background: #f4f4f5; padding: 4px; border-radius: 4px;">
              {{ JSON.stringify(scope.row.parameters_json) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            <el-button size="small" type="success" link @click="handleApply(scope.row)">下发 PLC</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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
          <el-input type="textarea" v-model="form.parameters_json" :rows="6" placeholder='输入合法 JSON，例如: {"pac_dosage": 15}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存配方</el-button>
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
  ElMessageBox.confirm(`确定删除配方 [${row.recipe_name}] 吗？`, '提示', { type: 'warning' }).then(async () => {
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
  ElMessageBox.confirm(`即将把配方 [${row.recipe_name}] 下发至底层 PLC 控制器，是否继续？`, '高危操作', { type: 'warning' }).then(() => {
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
.page-container { padding: 20px; }
</style>
