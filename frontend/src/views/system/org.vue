<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd(0)">新增顶级部门</el-button>
    </div>

    <el-table
      :data="tableData"
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="dept_name" label="部门名称" />
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleAdd(row.id)">新增子部门</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="父级部门" prop="parent_id">
          <el-tree-select
            v-model="form.parent_id"
            :data="deptOptions"
            :props="{ value: 'id', label: 'dept_name', children: 'children' }"
            check-strictly
            placeholder="请选择父级部门"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="dept_name">
          <el-input v-model="form.dept_name" placeholder="请输入部门名称" />
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
const deptOptions = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增部门')
const formRef = ref()

const form = ref({
  id: undefined,
  parent_id: 0,
  dept_name: '',
})

const rules = {
  dept_name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/system/dept/tree')
    tableData.value = res.data || []
    deptOptions.value = [{ id: 0, dept_name: '顶级部门', children: res.data }]
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    id: undefined,
    parent_id: 0,
    dept_name: '',
  }
}

const handleAdd = (parentId: number) => {
  resetForm()
  form.value.parent_id = parentId
  dialogTitle.value = '新增部门'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  resetForm()
  form.value = {
    id: row.id,
    parent_id: row.parent_id,
    dept_name: row.dept_name,
  }
  dialogTitle.value = '编辑部门'
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('存在子部门，不允许删除')
    return
  }
  ElMessageBox.confirm(`确认删除部门 "${row.dept_name}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/system/dept/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/system/dept/update/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/system/dept/create', form.value)
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
