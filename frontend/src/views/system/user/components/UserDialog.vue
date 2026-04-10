<template>
  <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" @close="handleClose">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="登录名" prop="username" v-if="!form.id">
            <el-input v-model="form.username" placeholder="请输入登录名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门ID" prop="dept_id">
            <el-input-number v-model="form.dept_id" :min="1" placeholder="请输入部门ID" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%" class="dark-input">
              <el-option
                v-for="dict in sys_user_sex"
                :key="dict.dict_value"
                :label="dict.dict_label"
                :value="parseInt(dict.dict_value)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="分配角色" prop="roleIds">
        <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%" class="dark-input">
          <el-option v-for="item in roleOptions" :key="item.id" :label="item.role_name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status" v-if="form.id">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in sys_normal_disable"
            :key="dict.dict_value"
            :value="parseInt(dict.dict_value)"
          >{{ dict.dict_label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useDict } from '@/hooks/useDict'

const emit = defineEmits(['success'])

const { sys_user_sex, sys_normal_disable } = useDict('sys_user_sex', 'sys_normal_disable')

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formRef = ref()
const deptOptions = ref<any[]>([])
const roleOptions = ref<any[]>([])

const form = ref({
  id: undefined as number | undefined,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0,
  dept_id: 1,
  roleIds: [] as number[],
  status: 1,
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请输入登录名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  dept_id: [{ required: true, message: '请输入部门ID', trigger: 'blur' }]
}

const fetchOptions = async () => {
  try {
    const res = await request.get('/api/v1/system/dept/tree')
    deptOptions.value = [{ id: 0, dept_name: '顶级部门', children: res }]
    const roleRes = await request.get('/api/v1/system/role/list')
    roleOptions.value = roleRes || []
  } catch (e) { /* fallback */ }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.value = {
    id: undefined,
    username: '',
    nickname: '',
    phone: '',
    email: '',
    gender: 0,
    dept_id: 1,
    roleIds: [],
    status: 1,
    remark: ''
  }
}

const open = async (row?: any) => {
  dialogTitle.value = row ? '编辑用户' : '新增用户'
  dialogVisible.value = true
  await fetchOptions()
  resetForm()
  
  if (row) {
    form.value = {
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      phone: row.phone,
      email: row.email,
      gender: row.gender,
      dept_id: row.dept_id,
      roleIds: row.roles ? row.roles.map((r: any) => r.id) : [],
      status: row.status,
      remark: row.remark
    }
  }
}

const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/v1/system/user/update/${form.value.id}`, {
            nickname: form.value.nickname,
            phone: form.value.phone,
            email: form.value.email,
            gender: form.value.gender,
            dept_id: form.value.dept_id,
            status: form.value.status,
            remark: form.value.remark
          })
          ElMessage.success('更新成功')
        } else {
          await request.post('/api/v1/system/user/create', {
            username: form.value.username,
            nickname: form.value.nickname,
            phone: form.value.phone,
            email: form.value.email,
            gender: form.value.gender,
            dept_id: form.value.dept_id,
            remark: form.value.remark
          })
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        emit('success')
      } catch (e) {
        // error is typically handled globally, but we catch to avoid unhandled promise rejection
      }
    }
  })
}

defineExpose({
  open
})
</script>

<style scoped>
.dark-input {
  /* keep original style if any */
}
</style>
