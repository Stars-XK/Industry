<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd(0)">新增顶级菜单</el-button>
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
      <el-table-column prop="menu_name" label="菜单名称" width="200" />
      <el-table-column prop="icon" label="图标" width="80" />
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column prop="menu_type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.menu_type === 'M'" type="info">目录</el-tag>
          <el-tag v-else-if="row.menu_type === 'C'" type="success">菜单</el-tag>
          <el-tag v-else-if="row.menu_type === 'F'" type="warning">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" />
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="perm_code" label="权限标识" />
      <el-table-column prop="visible" label="显示状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.visible === 1 ? 'success' : 'danger'">
            {{ row.visible === 1 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="菜单状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleAdd(row.id)">新增子项</el-button>
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
    const res = await request.get('/api/system/menu/tree')
    tableData.value = res.data || res || []
    menuOptions.value = [{ id: 0, menu_name: '主类目', children: tableData.value }]
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
    await request.delete(`/api/system/menu/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/system/menu/update/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/system/menu/create', form.value)
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
