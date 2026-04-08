<template>
  <div class="premium-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">组织架构管理</h1>
        <p class="page-subtitle">Organizational Structure & Departments</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="handleAdd(0)">新增顶级部门</el-button>
      </div>
    </div>

    <div class="glass-panel" style="flex: 1; padding: 20px;">
      <el-table
        :data="tableData"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        class="dark-table custom-scrollbar"
        v-loading="loading"
        element-loading-background="rgba(15,23,42,0.8)"
      >
        <el-table-column prop="dept_name" label="部门名称" min-width="200">
          <template #default="{ row }">
            <span style="color: #e2e8f0; font-weight: 500;">{{ row.dept_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :class="row.status === 1 ? 'success-tag' : 'danger-tag'" effect="dark" style="border: none;">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" width="120">
          <template #default="{ row }">
            <span style="color: #00d8ff;">{{ row.leader }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns" style="justify-content: center;">
              <el-button class="action-btn text-emerald" link size="small" @click="handleAdd(row.id)">新增子部门</el-button>
              <el-button class="action-btn text-cyan" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button class="action-btn text-rose" link size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" class="glass-dialog" :show-close="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="dark-form" label-position="left">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="上级部门" prop="parent_id">
              <el-tree-select
                v-model="form.parent_id"
                :data="deptOptions"
                :props="{ value: 'id', label: 'dept_name', children: 'children' }"
                check-strictly
                placeholder="请选择上级部门"
                style="width: 100%"
                class="glass-tree-select"
                popper-class="glass-dropdown"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="部门名称" prop="dept_name">
              <el-input v-model="form.dept_name" placeholder="请输入部门名称" class="glass-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort_order">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" controls-position="right" class="glass-input-number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" class="glass-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" class="glass-input" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" class="glass-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态" prop="status">
              <el-radio-group v-model="form.status" class="dark-radio-group">
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
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" class="glass-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="submitForm">确认保存</el-button>
        </div>
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
    const res = await request.get('/api/system/dept/tree')
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
    await request.delete(`/api/system/dept/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
        if (form.value.id) {
          await request.put(`/api/system/dept/${form.value.id}`, form.value)
          ElMessage.success('更新成功')
        } else {
          await request.post('/api/system/dept', form.value)
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
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}
.success-tag {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.danger-tag {
  background-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
}
.action-btns {
  display: flex;
  gap: 12px;
}
.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
  transform: translateY(-1px);
}
.text-cyan { color: #00d8ff; }
.text-emerald { color: #10b981; }
.text-rose { color: #f43f5e; }
/* Table styles */
:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}
:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-table-border-color); }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: var(--el-table-row-hover-bg-color) !important; }
:deep(.el-table::before) { display: none; }
.custom-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
}
/* Dialog Styles */
:deep(.glass-dialog) {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
:deep(.dark-form .el-form-item__label) {
  color: #94a3b8;
  font-weight: 500;
}
:deep(.glass-input .el-input__wrapper),
:deep(.glass-input-number .el-input__wrapper),
:deep(.glass-input .el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #e2e8f0;
}
:deep(.glass-input .el-input__wrapper:hover),
:deep(.glass-input-number .el-input__wrapper:hover),
:deep(.glass-input .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}
:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input-number .el-input__wrapper.is-focus),
:deep(.glass-input .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}
:deep(.glass-tree-select .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-tree-select .el-input__inner),
:deep(.glass-input .el-input__inner),
:deep(.glass-input-number .el-input__inner) {
  color: #e2e8f0;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
}
:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #00d8ff !important;
}
:deep(.dark-radio-group .el-radio) {
  color: #94a3b8;
}
:deep(.dark-radio-group .el-radio__input.is-checked + .el-radio__label) {
  color: #00d8ff;
}
:deep(.dark-radio-group .el-radio__input.is-checked .el-radio__inner) {
  border-color: #00d8ff;
  background: #00d8ff;
}
</style>
