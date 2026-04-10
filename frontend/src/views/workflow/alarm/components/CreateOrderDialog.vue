<template>
  <el-dialog title="下发抢修工单" v-model="visible" width="500px" @close="resetForm" :show-close="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position="top">
      <el-form-item label="工单标题" prop="title">
        <el-input v-model="form.title" placeholder="如：泵站紧急抢修" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工单类型" prop="order_type">
            <el-select v-model="form.order_type" style="width: 100%" popper-class="glass-dropdown">
              <el-option label="抢修工单" :value="2" />
              <el-option label="听漏工单" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" style="width: 100%" popper-class="glass-dropdown">
              <el-option label="中" :value="2" />
              <el-option label="高" :value="3" />
              <el-option label="紧急" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="任务描述" prop="description">
        <el-input type="textarea" v-model="form.description" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitOrderForm">确定下发</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const emit = defineEmits(['success'])
const visible = ref(false)
const formRef = ref()

const form = ref({
  alarm_id: null as any,
  device_id: null as any,
  title: '',
  order_type: 2,
  priority: 4,
  description: ''
})

const rules = {
  title: [{ required: true, message: '必填', trigger: 'blur' }]
}

const open = (row: any) => {
  form.value.alarm_id = row.id
  form.value.device_id = row.device_id
  form.value.title = `由报警触发：[${row.device_name}] 异常抢修`
  form.value.description = `报警描述：${row.alarm_desc}\n触发SOP：${row.sop_name || '无'}`
  visible.value = true
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
}

const submitOrderForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post('/api/v1/workflow/order', form.value)
        ElMessage.success('抢修工单下发成功')
        visible.value = false
        // 自动确认报警
        await request.put(`/api/v1/workflow/alarm/events/${form.value.alarm_id}/confirm`)
        emit('success')
      } catch (e) {
         // fallback
         emit('success')
      }
    }
  })
}

defineExpose({ open })
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>