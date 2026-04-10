<template>
  <el-dialog :title="title" v-model="visible" width="400px" custom-class="premium-dialog">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="字典标签" prop="dict_label">
        <el-input v-model="form.dict_label" placeholder="请输入字典标签 (如: 智能水表)" />
      </el-form-item>
      <el-form-item label="字典键值" prop="dict_value">
        <el-input v-model="form.dict_value" placeholder="请输入字典键值 (如: 1)" />
      </el-form-item>
      <el-form-item label="排序" prop="dict_sort">
        <el-input-number v-model="form.dict_sort" :min="0" style="width: 100%" />
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
const title = ref('新增字典项')
const formRef = ref()
const currentDictType = ref('')

const form = ref({
  id: undefined,
  dict_type: '',
  dict_label: '',
  dict_value: '',
  dict_sort: 0
})

const rules = {
  dict_label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dict_value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }]
}

const open = (dictType: string, row?: any, sortValue: number = 0) => {
  currentDictType.value = dictType
  visible.value = true
  if (row) {
    title.value = '编辑字典项'
    form.value = { ...row }
  } else {
    title.value = '新增字典项'
    form.value = { 
      id: undefined, 
      dict_type: dictType, 
      dict_label: '', 
      dict_value: '', 
      dict_sort: sortValue 
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/v1/system/dict/data/${form.value.id}`, form.value)
          ElMessage.success('更新数据成功')
        } else {
          await request.post('/api/v1/system/dict/data', form.value)
          ElMessage.success('新增数据成功')
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
