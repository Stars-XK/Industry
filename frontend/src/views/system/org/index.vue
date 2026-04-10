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
        <el-table-column prop="dept_name" label="部门名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-text-color-primary); font-weight: 500;">{{ row.dept_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" align="center"  show-overflow-tooltip />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :class="row.status === 1 ? 'success-tag' : 'danger-tag'" effect="dark" style="border: none;">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leader" label="负责人" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-color-primary);">{{ row.leader }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="220">
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
    <OrgDialog ref="orgDialogRef" @success="getList" />
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入部门数据"
      templateName="部门档案"
      :templateColumns="['上级部门ID', '部门编码', '部门名称', '负责人', '联系电话', '邮箱', '备注']"
      @import-data="handleImportData"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import OrgDialog from './components/OrgDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const showImport = ref(false)
const tableData = ref([])
const deptOptions = ref<any[]>([])
const orgDialogRef = ref()
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
const handleAdd = (parentId: number) => {
  orgDialogRef.value?.open(deptOptions.value, null, parentId)
}
const handleEdit = (row: any) => {
  orgDialogRef.value?.open(deptOptions.value, row)
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

const handleImportData = async (data: any[]) => {
  if (!data || data.length === 0) return
  let successCount = 0
  let failCount = 0
  
  loading.value = true
  for (const item of data) {
    try {
      const payload = {
        parent_id: item['上级部门ID'] || 0,
        dept_name: item['部门名称'],
        leader: item['负责人'],
        phone: item['联系电话'],
        email: item['邮箱'],
        remark: item['备注'],
        status: 1,
        sort_order: 0
      }
      await request.post('/api/v1/system/dept', payload)
      successCount++
    } catch (e) {
      failCount++
    }
  }
  loading.value = false
  ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`)
  getList()
}

onMounted(() => {
  getList()
})
</script>
<style scoped>

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
