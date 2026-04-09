<template>
  <div class="app-container fade-in-up">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-icon style="margin-right: 8px; vertical-align: middle;"><User /></el-icon>用户与账号管理</span>
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
              <el-icon style="margin-right: 4px;"><Plus /></el-icon> 新增用户
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" class="custom-table" v-loading="loading" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center" />
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
            <el-tag v-for="role in scope.row.roles" :key="role.id" size="small" type="info" effect="light" style="margin-right:4px; margin-bottom:4px;">
              {{ role.role_name }}
            </el-tag>
            <span v-if="!scope.row.roles || scope.row.roles.length === 0" style="color: var(--el-text-color-placeholder)">未分配</span>
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
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon style="margin-right: 2px;"><Edit /></el-icon> 编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              <el-icon style="margin-right: 2px;"><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
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
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Edit, Delete } from '@element-plus/icons-vue'
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
    const res = await request.get('/api/v1/system/dept/tree')
    deptOptions.value = [{ id: 0, dept_name: '顶级部门', children: res }]
    const roleRes = await request.get('/api/v1/system/role/list')
    roleOptions.value = roleRes || []
  } catch (e) { /* fallback */ }
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
    const res = await request.get('/api/v1/system/user/list?page=1&size=50')
    tableData.value = Array.isArray(res) ? res : (res.data ? res.data : (res.list || []))?.list || res.list || []
  } catch (e) { /* fallback */ } finally {
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
    await request.delete(`/api/v1/system/user/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
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
      getList()
    }
  })
}
onMounted(() => {
  getList()
})
</script>
<style scoped>
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}
.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar {
  display: flex;
  gap: 12px;
}
.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}
/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 500;
}
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.status-dot.success {
  background-color: var(--el-color-success);
  box-shadow: 0 0 4px var(--el-color-success-light-6);
}
.status-dot.danger {
  background-color: var(--el-color-danger);
  box-shadow: 0 0 4px var(--el-color-danger-light-6);
}
.status-dot.warning {
  background-color: var(--el-color-warning);
  box-shadow: 0 0 4px var(--el-color-warning-light-6);
}
.status-dot.info {
  background-color: var(--el-color-primary);
  box-shadow: 0 0 4px var(--el-color-primary-light-6);
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
