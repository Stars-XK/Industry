<template>
  <div class="app-container fade-in-up">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-icon style="margin-right: 8px; vertical-align: middle;"><Lock /></el-icon>角色与权限体系 (RBAC)</span>
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
              <el-icon style="margin-right: 4px;"><Plus /></el-icon> 新增角色
            </el-button>
            <el-button @click="showImport = true">
              <el-icon style="margin-right: 4px;"><Upload /></el-icon> 批量导入
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" class="custom-table" v-loading="loading" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="role_name" label="角色名称" min-width="150">
          <template #default="{ row }">
            <span style="font-weight: 500;">{{ row.role_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="role_key" label="角色标识" width="150">
          <template #default="{ row }">
            <span class="highlight-text">{{ row.role_key }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="role_sort" label="排序" width="80" align="center" />
        <el-table-column prop="data_scope" label="数据范围" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.data_scope === 1" type="danger" effect="light">全部数据</el-tag>
            <el-tag v-else-if="row.data_scope === 2" type="warning" effect="light">本部门</el-tag>
            <el-tag v-else-if="row.data_scope === 3" type="info" effect="light">自定义</el-tag>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="light">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ new Date(row.created_at).toLocaleString() }}</span>
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="right">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="role_name">
              <el-input v-model="form.role_name" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色标识" prop="role_key">
              <el-input v-model="form.role_key" placeholder="如 admin" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="role_sort">
              <el-input-number v-model="form.role_sort" :min="0" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
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
        <el-form-item label="数据范围" prop="data_scope">
          <el-select v-model="form.data_scope" placeholder="请选择数据范围" style="width: 100%">
            <el-option 
              v-for="dict in sys_data_scope" 
              :key="dict.dict_value" 
              :label="dict.dict_label" 
              :value="parseInt(dict.dict_value)" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单权限">
          <div class="tree-container">
            <el-tree
              ref="menuTreeRef"
              :data="menuOptions"
              show-checkbox
              node-key="id"
              :props="{ label: 'menu_name', children: 'children' }"
            />
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入用户数据"
      templateName="用户档案"
      :templateColumns="['所属部门ID', '登录账号', '用户姓名', '手机号码', '角色ID', '状态(0/1)']"
      @success="getList"
    />
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useDict } from '@/hooks/useDict'
const { sys_normal_disable, sys_data_scope } = useDict('sys_normal_disable', 'sys_data_scope')
const loading = ref(false)
const showImport = ref(false)
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
    const res = await request.get('/api/v1/system/role/list')
    tableData.value = Array.isArray(res) ? res : (res.list || []) || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const getMenuTree = async () => {
  try {
    const res = await request.get('/api/v1/system/menu/tree')
    menuOptions.value = res || []
  } catch (e) { /* fallback */ }
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
    await request.delete(`/api/v1/system/role/delete/${row.id}`)
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
        await request.put(`/api/v1/system/role/update/${form.value.id}`, payload)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/v1/system/role/create', payload)
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
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  flex: 1;
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
.time-text {
  color: var(--el-text-color-regular);
  font-family: 'SF Mono', monospace;
  font-size: 13px;
}
.highlight-text {
  font-family: "SF Mono", monospace;
  font-weight: 500;
}
.tree-container {
  width: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 10px;
  background-color: var(--el-fill-color-blank);
  max-height: 300px;
  overflow-y: auto;
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
