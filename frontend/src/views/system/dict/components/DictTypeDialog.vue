<template>
  <el-dialog :title="title" v-model="visible" width="400px" custom-class="premium-dialog">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="字典名称" prop="dict_name">
        <el-input v-model="form.dict_name" placeholder="请输入字典名称 (如: 设备类型)" />
      </el-form-item>
      <el-form-item label="字典标识" prop="dict_type">
        <el-input v-model="form.dict_type" placeholder="请输入字典标识 (如: sys_device_type)" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const emit = defineEmits(['success'])
const visible = ref(false)
const title = ref('新增字典类型')
const formRef = ref()
const isEdit = ref(false)

const form = ref({
  id: undefined,
  dict_name: '',
  dict_type: '',
  remark: ''
})

const rules = {
  dict_name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dict_type: [{ required: true, message: '请输入字典标识', trigger: 'blur' }]
}

const open = (row?: any) => {
  visible.value = true
  if (row) {
    isEdit.value = true
    title.value = '编辑字典类型'
    form.value = { ...row }
  } else {
    isEdit.value = false
    title.value = '新增字典类型'
    form.value = { id: undefined, dict_name: '', dict_type: '', remark: '' }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/v1/system/dict/type/${form.value.id}`, form.value)
          ElMessage.success('更新类型成功')
        } else {
          await request.post('/api/v1/system/dict/type', form.value)
          ElMessage.success('新增类型成功')
        }
        visible.value = false
        emit('success')
      } catch (e: any) {
        ElMessage.error(e.message || '操作失败')
      }
    }
  })
}

defineExpose({ open })
</script>
