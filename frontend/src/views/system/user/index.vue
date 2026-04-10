<template>
  <div class="app-container fade-in-up">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-icon style="margin-right: 8px; vertical-align: middle;"><User /></el-icon>用户与账号管理</span>
          <div class="toolbar">
            <el-button type="primary" @click="handleAdd">
              <el-icon style="margin-right: 4px;"><Plus /></el-icon> 新增用户
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" class="custom-table" v-loading="loading" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" align="center"  width="80" />
        <el-table-column prop="username" label="登录名"  show-overflow-tooltip  />
        <el-table-column prop="nickname" label="用户昵称"  show-overflow-tooltip  />
        <el-table-column prop="gender" label="性别" width="80" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.gender === 1" class="status-dot info"></span>
            <span v-else-if="row.gender === 2" class="status-dot danger"></span>
            <span v-else class="status-dot warning"></span>
            {{ row.gender === 1 ? '男' : (row.gender === 2 ? '女' : '未知') }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号"  show-overflow-tooltip  />
        <el-table-column prop="email" label="邮箱"  show-overflow-tooltip  />
        <el-table-column prop="dept_id" label="部门ID" width="80"  show-overflow-tooltip />
        <el-table-column label="分配角色" width="180" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-for="role in scope.row.roles" :key="role.id" size="small" type="info" effect="light" style="margin-right:4px; margin-bottom:4px;">
              {{ role.role_name }}
            </el-tag>
            <span v-if="!scope.row.roles || scope.row.roles.length === 0" style="color: var(--el-text-color-placeholder)">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'status-dot success' : 'status-dot danger'"></span>
            {{ row.status === 1 ? '正常' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="160">
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
    <UserDialog ref="userDialogRef" @success="getList" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Edit, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'
import UserDialog from './components/UserDialog.vue'

const loading = ref(false)
const tableData = ref([])
const userDialogRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/system/user/list?page=1&size=50')
    tableData.value = Array.isArray(res) ? res : (res.data ? res.data : (res.list || []))?.list || res.list || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  userDialogRef.value?.open()
}

const handleEdit = (row: any) => {
  userDialogRef.value?.open(row)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除用户 "${row.username}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/v1/system/user/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
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
