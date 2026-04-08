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
      element-loading-text="Thinking..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table-column prop="dept_name" label="部门名称" />
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="leader" label="负责人" width="120" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleAdd(row.id)">新增子部门</el-button>
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="上级部门" prop="parent_id">
              <el-tree-select
                v-model="form.parent_id"
                :data="deptOptions"
                :props="{ value: 'id', label: 'dept_name', children: 'children' }"
                check-strictly
                placeholder="请选择上级部门"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门名称" prop="dept_name">
              <el-input v-model="form.dept_name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort_order">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态" prop="status">
          <el-radio-group v-model="form.status">
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
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import { useDict } from '@/hooks/useDict'

const { sys_normal_disable } = useDict('sys_normal_disable')

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

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/auth/system/dept/tree')
    tableData.value = res || []
    deptOptions.value = [{ id: 0, dept_name: '顶级部门', children: res }]
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
    sort_order: 0,
    leader: '',
    phone: '',
    email: '',
    status: 1,
    remark: ''
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
    sort_order: row.sort_order,
    leader: row.leader,
    phone: row.phone,
    email: row.email,
    status: row.status,
    remark: row.remark
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
    await request.delete(`/api/auth/system/dept/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/auth/system/dept/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/auth/system/dept', form.value)
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
