<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">组织架构管理</h1>
        <p class="page-subtitle">Organizational Structure & Departments</p>
      </div>
      <div class="header-actions">
        <el-button  @click="handleAdd(0)">新增顶级部门</el-button>
        <el-button  @click="showImport = true" icon="Upload">批量导入</el-button>
      </div>
    </div>
    <div class="box-card" style="flex: 1; padding: 20px;">
      <el-table
        :data="tableData"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        class="custom-table custom-scrollbar"
        v-loading="loading"
      >
        <el-table-column prop="dept_name" label="部门名称" min-width="200">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-primary); font-weight: 500;">{{ row.dept_name }}</span>
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
            <span style="color: var(--el-color-primary);">{{ row.leader }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px"  :show-close="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px"  label-position="left">
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
              <el-input v-model="form.dept_name" placeholder="请输入部门名称"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="sort_order">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" controls-position="right" class="-number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话"  />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态" prop="status">
              <el-radio-group v-model="form.status" >
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
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"  />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button  @click="submitForm">确认保存</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入部门数据"
      templateName="部门档案"
      :templateColumns="['上级部门ID', '部门编码', '部门名称', '负责人', '联系电话', '邮箱', '备注']"
      @success="getList"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useDict } from '@/hooks/useDict'
const { sys_normal_disable } = useDict('sys_normal_disable')
const loading = ref(false)
const showImport = ref(false)
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
    const res = await request.get('/api/v1/system/dept/tree')
    tableData.value = res || []
    deptOptions.value = [{ id: 0, dept_name: '顶级部门', children: res }]
  } catch (e) { /* fallback */ } finally {
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
    await request.delete(`/api/v1/system/dept/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
        if (form.value.id) {
          await request.put(`/api/v1/system/dept/${form.value.id}`, form.value)
          ElMessage.success('更新成功')
        } else {
          await request.post('/api/v1/system/dept', form.value)
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
.toolbar, .header-actions {
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
.action-btns {
  display: flex;
  gap: 12px;
}
.text-cyan { color: var(--el-color-primary); }
.text-emerald { color: var(--el-color-success); }
.text-rose { color: var(--el-color-danger); }
/* Table styles */
/* Dialog Styles */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
