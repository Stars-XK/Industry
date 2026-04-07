<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="role_name" label="角色名称" />
      <el-table-column prop="role_key" label="角色标识" />
      <el-table-column prop="role_sort" label="排序" width="80" />
      <el-table-column prop="data_scope" label="数据范围">
        <template #default="{ row }">
          <el-tag v-if="row.data_scope === 1" type="danger">全部数据</el-tag>
          <el-tag v-else-if="row.data_scope === 2" type="warning">本部门</el-tag>
          <el-tag v-else-if="row.data_scope === 3" type="info">自定义</el-tag>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '停用' }}
          </el-tag>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="role_name">
              <el-input v-model="form.role_name" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色标识" prop="role_key">
              <el-input v-model="form.role_key" placeholder="请输入角色标识 (如 admin)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="role_sort">
              <el-input-number v-model="form.role_sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">正常</el-radio>
                <el-radio :value="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="数据范围" prop="data_scope">
          <el-select v-model="form.data_scope" placeholder="请选择数据范围" style="width: 100%">
            <el-option label="全部数据" :value="1" />
            <el-option label="本部门" :value="2" />
            <el-option label="自定义" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :props="{ label: 'menu_name', children: 'children' }"
            style="width: 100%; border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px;"
          />
        </el-form-item>
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
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const menuOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref()
const menuTreeRef = ref()

const form = ref({
  id: undefined,
  role_name: '',
  role_key: '',
  role_sort: 0,
  data_scope: 2,
  status: 1,
  remark: ''
})

const rules = {
  role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  role_key: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
}

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/system/role/list')
    tableData.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getMenuTree = async () => {
  try {
    const res = await request.get('/api/system/menu/tree')
    menuOptions.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const resetForm = () => {
  form.value = {
    id: undefined,
    role_name: '',
    role_key: '',
    role_sort: 0,
    data_scope: 2,
    status: 1,
    remark: ''
  }
  if (menuTreeRef.value) {
    menuTreeRef.value.setCheckedKeys([])
  }
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

const handleEdit = async (row: any) => {
  resetForm()
  form.value = {
    id: row.id,
    role_name: row.role_name,
    role_key: row.role_key,
    role_sort: row.role_sort,
    data_scope: row.data_scope,
    status: row.status,
    remark: row.remark
  }
  dialogTitle.value = '编辑角色'
  dialogVisible.value = true
  
  await nextTick()
  if (menuTreeRef.value && row.menus) {
    const menuIds = row.menus.map((m: any) => m.id)
    menuTreeRef.value.setCheckedKeys(menuIds)
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除角色 "${row.role_name}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/system/role/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const checkedKeys = menuTreeRef.value ? menuTreeRef.value.getCheckedKeys() : []
      const halfCheckedKeys = menuTreeRef.value ? menuTreeRef.value.getHalfCheckedKeys() : []
      const menu_ids = [...checkedKeys, ...halfCheckedKeys]

      const payload = {
        role_name: form.value.role_name,
        role_key: form.value.role_key,
        role_sort: form.value.role_sort,
        data_scope: form.value.data_scope,
        status: form.value.status,
        remark: form.value.remark,
        menu_ids
      }

      if (form.value.id) {
        await request.put(`/api/system/role/update/${form.value.id}`, payload)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/system/role/create', payload)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getList()
    }
  })
}

onMounted(() => {
  getList()
  getMenuTree()
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
