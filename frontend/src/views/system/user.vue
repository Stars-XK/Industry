<template>
  <div class="premium-container fade-in-up">
    <div class="glass-panel hover-lift">
      <div class="toolbar">
        <el-button type="primary" class="neon-btn" @click="handleAdd">新增用户</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" class="dark-table" v-loading="loading"
        element-loading-text="Thinking..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="登录名" />
        <el-table-column prop="nickname" label="用户昵称" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span v-if="row.gender === 1" class="status-dot info"></span>
            <span v-else-if="row.gender === 2" class="status-dot danger"></span>
            <span v-else class="status-dot warning"></span>
            {{ row.gender === 1 ? '男' : (row.gender === 2 ? '女' : '未知') }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="dept_id" label="部门ID" width="80" />
        <el-table-column label="分配角色" width="180">
          <template #default="scope">
            <el-tag v-for="role in scope.row.roles" :key="role.id" size="small" class="mr-1 custom-tag" style="margin-right:4px;">
              {{ role.role_name }}
            </el-tag>
            <span v-if="!scope.row.roles || scope.row.roles.length === 0" class="text-gray-400">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'status-dot success' : 'status-dot danger'"></span>
            {{ row.status === 1 ? '正常' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" custom-class="glass-dialog">
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
        <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
        <el-button type="primary" @click="submitForm" class="neon-btn">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useDict } from '@/hooks/useDict'

const { sys_user_sex, sys_normal_disable } = useDict('sys_user_sex', 'sys_normal_disable')

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formRef = ref()

const deptOptions = ref<any[]>([])
const roleOptions = ref<any[]>([])

const fetchOptions = async () => {
  try {
    const res = await request.get('/api/system/dept/tree')
    deptOptions.value = [{ id: 0, dept_name: '顶级部门', children: res }]
    
    const roleRes = await request.get('/api/system/role/list')
    roleOptions.value = roleRes || []
  } catch (e) {}
}

const form = ref({
  id: undefined,
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

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/system/user/list?page=1&size=50')
    tableData.value = res.data?.list || res.list || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
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

const handleAdd = async () => {
  await fetchOptions()
  resetForm()
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

const handleEdit = async (row: any) => {
  await fetchOptions()
  resetForm()
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
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除用户 "${row.username}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/system/user/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/system/user/update/${form.value.id}`, {
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
        await request.post('/api/system/user/create', {
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
      getList()
    }
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}
.custom-tag {
  background: rgba(0, 216, 255, 0.1);
  border: 1px solid rgba(0, 216, 255, 0.3);
  color: #00d8ff;
}
</style>
