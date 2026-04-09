<template>
  <div class="app-container fade-in-up">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-icon style="margin-right: 8px; vertical-align: middle;"><Menu /></el-icon>菜单与导航配置</span>
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd(0)">
              <el-icon style="margin-right: 4px;"><Plus /></el-icon> 新增顶级菜单
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        :data="tableData"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        class="custom-table"
        v-loading="loading"
        stripe highlight-current-row
      >
        <el-table-column prop="menu_name" label="菜单名称" width="200" />
        <el-table-column prop="icon" label="图标" width="80" />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column prop="menu_type" label="类型" width="80">
          <template #default="{ row }">
            <span :class="'status-dot ' + (row.menu_type === 'M' ? 'info' : (row.menu_type === 'C' ? 'success' : 'warning'))"></span>
            {{ row.menu_type === 'M' ? '目录' : (row.menu_type === 'C' ? '菜单' : '按钮') }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="component" label="组件路径" />
        <el-table-column prop="perm_code" label="权限标识" />
        <el-table-column prop="visible" label="显示状态" width="100">
          <template #default="{ row }">
            <span :class="row.visible === 1 ? 'status-dot success' : 'status-dot danger'"></span>
            {{ row.visible === 1 ? '显示' : '隐藏' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="菜单状态" width="100">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'status-dot success' : 'status-dot danger'"></span>
            {{ row.status === 1 ? '正常' : '停用' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="success" @click="handleAdd(row.id)">
              <el-icon style="margin-right: 2px;"><Plus /></el-icon> 新增子项
            </el-button>
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
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parent_id">
              <el-tree-select
                v-model="form.parent_id"
                :data="menuOptions"
                :props="{ value: 'id', label: 'menu_name', children: 'children' }"
                check-strictly
                placeholder="请选择上级菜单"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="菜单类型" prop="menu_type">
          <el-radio-group v-model="form.menu_type">
            <el-radio
              v-for="dict in sys_menu_type"
              :key="dict.dict_value"
              :value="dict.dict_value"
            >{{ dict.dict_label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menu_name">
              <el-input v-model="form.menu_name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort_order">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.menu_type !== 'F'">
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input v-model="form.path" placeholder="路由路径 (如 /system/user)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <el-input v-model="form.icon" placeholder="请输入图标名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="form.menu_type === 'C'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menu_type !== 'M'">
            <el-form-item label="权限标识" prop="perm_code">
              <el-input v-model="form.perm_code" placeholder="权限标识" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.menu_type !== 'F'">
          <el-col :span="12">
            <el-form-item label="显示状态" prop="visible">
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in sys_show_hide"
                  :key="dict.dict_value"
                  :value="parseInt(dict.dict_value)"
                >{{ dict.dict_label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单状态" prop="status">
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
        <el-row :gutter="20" v-if="form.menu_type !== 'F'">
          <el-col :span="12">
            <el-form-item label="是否外链" prop="is_frame">
              <el-radio-group v-model="form.is_frame">
                <el-radio
                  v-for="dict in sys_yes_no"
                  :key="dict.dict_value"
                  :value="parseInt(dict.dict_value)"
                >{{ dict.dict_label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否缓存" prop="is_cache">
              <el-radio-group v-model="form.is_cache">
                <el-radio
                  v-for="dict in sys_yes_no"
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
import { Menu, Plus, Edit, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { useDict } from '@/hooks/useDict'
const { sys_show_hide, sys_normal_disable, sys_menu_type, sys_yes_no } = useDict('sys_show_hide', 'sys_normal_disable', 'sys_menu_type', 'sys_yes_no')
const loading = ref(false)
const tableData = ref([])
const menuOptions = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const formRef = ref()
const form = ref({
  id: undefined,
  parent_id: 0,
  menu_name: '',
  menu_type: 'C',
  path: '',
  component: '',
  perm_code: '',
  icon: '#',
  sort_order: 0,
  is_frame: 0,
  is_cache: 0,
  visible: 1,
  status: 1,
  remark: ''
})
const rules = {
  menu_name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
}
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/system/menu/tree')
    tableData.value = Array.isArray(res) ? res : (res.data ? res.data : (res.list || [])) || res || []
    menuOptions.value = [{ id: 0, menu_name: '主类目', children: tableData.value }]
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const resetForm = () => {
  form.value = {
    id: undefined,
    parent_id: 0,
    menu_name: '',
    menu_type: 'C',
    path: '',
    component: '',
    perm_code: '',
    icon: '#',
    sort_order: 0,
    is_frame: 0,
    is_cache: 0,
    visible: 1,
    status: 1,
    remark: ''
  }
}
const handleAdd = (parentId: number) => {
  resetForm()
  form.value.parent_id = parentId
  dialogTitle.value = '新增菜单'
  dialogVisible.value = true
}
const handleEdit = (row: any) => {
  resetForm()
  form.value = {
    id: row.id,
    parent_id: row.parent_id,
    menu_name: row.menu_name,
    menu_type: row.menu_type,
    path: row.path,
    component: row.component,
    perm_code: row.perm_code,
    icon: row.icon,
    sort_order: row.sort_order,
    is_frame: row.is_frame,
    is_cache: row.is_cache,
    visible: row.visible,
    status: row.status,
    remark: row.remark
  }
  dialogTitle.value = '编辑菜单'
  dialogVisible.value = true
}
const handleDelete = (row: any) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('存在子菜单，不允许删除')
    return
  }
  ElMessageBox.confirm(`确认删除菜单 "${row.menu_name}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/v1/system/menu/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/v1/system/menu/update/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/v1/system/menu/create', form.value)
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
  min-height: calc(100vh - 60px);
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
