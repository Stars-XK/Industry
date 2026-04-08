<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>报警风暴收敛中心</span>
          <el-button type="primary" plain @click="fetchData">刷新列表</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="device_name" label="报警设备">
          <template #default="scope">
            <span style="font-weight: bold;">[{{ scope.row.device_code }}] {{ scope.row.device_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarm_type" label="报警类型" width="180" />
        <el-table-column prop="alarm_level" label="报警级别" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.alarm_level === 'HH' ? 'danger' : 'warning'">{{ scope.row.alarm_level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarm_desc" label="报警描述" />
        <el-table-column prop="status" label="处理状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="danger" effect="dark">未确认</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="warning" effect="dark">已确认</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="success" effect="dark">已恢复</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sop_name" label="关联SOP预案" width="200">
          <template #default="scope">
            <el-tag v-if="scope.row.sop_name" type="info">{{ scope.row.sop_name }}</el-tag>
            <span v-else class="text-gray-400">无预案</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 0" size="small" type="primary" link @click="handleConfirm(scope.row)">确认报警</el-button>
            <el-button v-if="scope.row.status !== 2" size="small" type="success" link @click="handleRecover(scope.row)">人工恢复</el-button>
            <el-button v-if="scope.row.status !== 2" size="small" type="warning" link @click="handleCreateOrder(scope.row)">生成工单</el-button>
            <el-button v-if="scope.row.status === 2" size="small" type="danger" link @click="handleDelete(scope.row)">清除记录</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="由报警生成工单" v-model="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="form.title" placeholder="如：泵站紧急抢修" />
        </el-form-item>
        <el-form-item label="工单类型" prop="order_type">
          <el-select v-model="form.order_type" style="width: 100%">
            <el-option label="抢修工单" :value="2" />
            <el-option label="听漏工单" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" style="width: 100%">
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
            <el-option label="紧急" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input type="textarea" v-model="form.description" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOrderForm">确定下发</el-button>
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
const formRef = ref()
const form = ref({
  alarm_id: null,
  device_id: null,
  title: '',
  order_type: 2,
  priority: 4,
  description: ''
})

const rules = {
  title: [{ required: true, message: '必填', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/workflow/alarm/events')
    tableData.value = res || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleConfirm = async (row: any) => {
  try {
    await request.put(`/api/workflow/alarm/events/${row.id}/confirm`)
    ElMessage.success('已确认报警')
    fetchData()
  } catch (e) {}
}

const handleRecover = async (row: any) => {
  try {
    await request.put(`/api/workflow/alarm/events/${row.id}/recover`)
    ElMessage.success('已人工标记为恢复')
    fetchData()
  } catch (e) {}
}

const handleDelete = async (row: any) => {
  ElMessageBox.confirm('确定清除该历史报警记录吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await request.delete(`/api/workflow/alarm/events/${row.id}`)
      ElMessage.success('清除成功')
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const handleCreateOrder = (row: any) => {
  form.value.alarm_id = row.id
  form.value.device_id = row.device_id
  form.value.title = `由报警触发：[${row.device_name}] 异常抢修`
  form.value.description = `报警描述：${row.alarm_desc}\n触发SOP：${row.sop_name || '无'}`
  dialogVisible.value = true
}

const submitOrderForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post('/api/workflow/order', form.value)
        ElMessage.success('抢修工单下发成功')
        dialogVisible.value = false
        // 自动确认报警
        await request.put(`/api/workflow/alarm/events/${form.value.alarm_id}/confirm`)
        fetchData()
      } catch (e) {}
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
