<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="登录名" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="dept_id" label="部门ID" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="登录名" prop="username" v-if="!form.id">
          <el-input v-model="form.username" placeholder="请输入登录名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="部门ID" prop="dept_id">
          <el-input-number v-model="form.dept_id" :min="1" placeholder="请输入部门ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="form.id">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const formRef = ref()

const form = ref({
  id: undefined,
  username: '',
  phone: '',
  dept_id: 1,
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入登录名', trigger: 'blur' }],
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
    phone: '',
    dept_id: 1,
    status: 1
  }
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  resetForm()
  form.value = {
    id: row.id,
    username: row.username,
    phone: row.phone,
    dept_id: row.dept_id,
    status: row.status
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
          phone: form.value.phone,
          dept_id: form.value.dept_id,
          status: form.value.status
        })
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/system/user/create', {
          username: form.value.username,
          phone: form.value.phone,
          dept_id: form.value.dept_id
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
.page-container {
  padding: 20px;
  background: #fff;
  height: 100%;
  border-radius: 4px;
}
.toolbar {
  margin-bottom: 20px;
}
</style>
