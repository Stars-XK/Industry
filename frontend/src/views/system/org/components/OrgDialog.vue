<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px"  :show-close="false">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px"  label-position="left">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="上级部门" prop="parent_id">
            <el-tree-select
              v-model="form.parent_id"
              :data="deptOptions"
              :props="{ value: 'id', label: 'dept_name', children: 'children' }"
              check-strictly
              placeholder="请选择上级部门"
              style="width: 100%"
              class="glass-tree-select"
              popper-class="glass-dropdown"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="部门名称" prop="dept_name">
            <el-input v-model="form.dept_name" placeholder="请输入部门名称"  />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sort_order">
            <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" controls-position="right" class="-number" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="form.leader" placeholder="请输入负责人"  />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话"  />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱"  />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态" prop="status">
            <el-radio-group v-model="form.status" >
              <el-radio 
                v-for="dict in sys_normal_disable" 
                :key="dict.dict_value" 
                :value="parseInt(dict.dict_value)"
              >{{ dict.dict_label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"  />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false" >取消</el-button>
        <el-button type="primary" @click="submitForm">确认保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useDict } from '@/hooks/useDict'

const emit = defineEmits(['success'])
const { sys_normal_disable } = useDict('sys_normal_disable')

const dialogVisible = ref(false)
const dialogTitle = ref('新增部门')
const formRef = ref()
const deptOptions = ref<any[]>([])

const form = ref({
  id: undefined,
  parent_id: 0,
  dept_name: '',
  sort_order: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
  remark: ''
})

const rules = {
  dept_name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

const open = (options: any[], row?: any, parentId?: number) => {
  deptOptions.value = options
  dialogVisible.value = true
  
  if (row) {
    dialogTitle.value = '编辑部门'
    form.value = {
      id: row.id,
      parent_id: row.parent_id,
      dept_name: row.dept_name,
      sort_order: row.sort_order,
      leader: row.leader,
      phone: row.phone,
      email: row.email,
      status: row.status,
      remark: row.remark
    }
  } else {
    dialogTitle.value = '新增部门'
    form.value = {
      id: undefined,
      parent_id: parentId || 0,
      dept_name: '',
      sort_order: 0,
      leader: '',
      phone: '',
      email: '',
      status: 1,
      remark: ''
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/v1/system/dept/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/v1/system/dept', form.value)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      emit('success')
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
