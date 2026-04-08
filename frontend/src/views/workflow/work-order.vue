<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">运维工单流转大盘</h1>
        <p class="page-subtitle">O&M Work Order Lifecycle Management</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="handleAdd">手工创建工单</el-button>
      </div>
    </div>

    <div class="glass-panel hover-lift" style="padding: 20px; flex: 1;">
      <el-table :data="tableData" style="width: 100%" class="dark-table custom-scrollbar" v-loading="loading" element-loading-background="rgba(15,23,42,0.8)">
        <el-table-column prop="order_sn" label="工单编号" width="180">
          <template #default="scope">
            <span class="highlight-text">{{ scope.row.order_sn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="任务标题" min-width="220">
          <template #default="scope">
            <span style="color: #e2e8f0; font-weight: 500;">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="order_type" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.order_type === 1" effect="dark" class="dark-tag">巡检</el-tag>
            <el-tag v-else-if="scope.row.order_type === 2" effect="dark" class="danger-tag">抢修</el-tag>
            <el-tag v-else-if="scope.row.order_type === 3" effect="dark" class="warning-tag">听漏</el-tag>
            <el-tag v-else effect="dark" class="dark-tag">保养</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="scope">
            <div class="priority-indicator" :class="scope.row.priority >= 4 ? 'priority-high' : (scope.row.priority === 3 ? 'priority-medium' : 'priority-low')">
              <span class="dot"></span>
              {{ scope.row.priority === 4 ? '紧急' : (scope.row.priority === 3 ? '高' : '中') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="handler_name" label="当前处理人" width="140">
          <template #default="scope">
            <div v-if="scope.row.handler_name" class="handler-badge">
              <el-icon><User /></el-icon> {{ scope.row.handler_name }}
            </div>
            <span v-else style="color: #64748b;">待派发</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="流转状态" width="120">
          <template #default="scope">
            <div class="status-indicator" :class="getStatusClass(scope.row.status)">
              <span class="dot"></span>
              {{ getStatusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="scope">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">
              {{ new Date(scope.row.created_at).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <div class="action-btns">
              <el-button v-if="scope.row.status === 10" size="small" class="action-btn text-cyan" link @click="handleAccept(scope.row)">指派</el-button>
              <el-button v-if="scope.row.status === 20" size="small" class="action-btn text-emerald" link @click="handleClose(scope.row)">闭环</el-button>
              <el-button size="small" class="action-btn" style="color: #94a3b8;" link @click="viewDetail(scope.row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="指派处理人" v-model="assignDialogVisible" width="400px" class="glass-dialog" :show-close="false">
      <el-form label-width="80px" class="dark-form" label-position="top">
        <el-form-item label="接单人">
          <el-select v-model="assignHandlerId" filterable placeholder="请选择维修工/处理人" style="width: 100%" class="glass-select" popper-class="glass-dropdown">
            <el-option v-for="u in usersOptions" :key="u.id" :label="`${u.nickname} (${u.username})`" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="submitAssign">确认派发</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="工单闭环" v-model="closeDialogVisible" width="500px" class="glass-dialog" :show-close="false">
      <el-form label-width="80px" class="dark-form" label-position="top">
        <el-form-item label="处理结果">
          <el-input type="textarea" v-model="closeResultDesc" :rows="4" placeholder="请详细描述故障原因及修复过程..." class="glass-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" style="border-color: #10b981; color: #10b981;" @click="submitClose">提交归档</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import request from '@/utils/request'

const tableData = ref<any[]>([])
const loading = ref(false)

const usersOptions = ref<any[]>([])

const assignDialogVisible = ref(false)
const assignHandlerId = ref<number | null>(null)
const currentOrder = ref<any>(null)

const closeDialogVisible = ref(false)
const closeResultDesc = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/workflow/order/list')
    tableData.value = res || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const fetchOptions = async () => {
  try {
    usersOptions.value = await request.get('/api/workflow/order/options/users') || []
  } catch (e) {}
}

const handleAdd = () => {
  ElMessage.info('手工建单请联系管理员，或通过设备台账直接下发。目前主要由报警风暴中心自动触发。')
}

const getStatusClass = (status: number) => {
  if (status === 10) return 'status-warning'
  if (status === 20) return 'status-primary'
  if (status === 30) return 'status-success'
  return ''
}

const getStatusText = (status: number) => {
  if (status === 10) return '待接单'
  if (status === 20) return '处理中'
  if (status === 30) return '已闭环'
  return '未知'
}

const handleAccept = async (row: any) => {
  await fetchOptions()
  currentOrder.value = row
  assignHandlerId.value = null
  assignDialogVisible.value = true
}

const submitAssign = async () => {
  if (!assignHandlerId.value) {
    ElMessage.warning('请选择接单人')
    return
  }
  try {
    await request.put(`/api/workflow/order/${currentOrder.value.id}/accept`, { handler_id: assignHandlerId.value })
    ElMessage.success('指派成功，工单已流转至处理中状态')
    assignDialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const handleClose = (row: any) => {
  currentOrder.value = row
  closeResultDesc.value = ''
  closeDialogVisible.value = true
}

const submitClose = async () => {
  if (!closeResultDesc.value) {
    ElMessage.warning('必须填写处理结果才能闭环归档')
    return
  }
  try {
    await request.put(`/api/workflow/order/${currentOrder.value.id}/close`, { result_desc: closeResultDesc.value })
    ElMessage.success('工单已成功闭环')
    closeDialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const viewDetail = (row: any) => {
  ElMessageBox.alert(`
    <div style="font-size:13px;line-height:1.8;">
      <b>工单编号:</b> ${row.order_sn}<br/>
      <b>故障描述:</b> ${row.description}<br/>
      <b>关联设备:</b> ${row.device_name || '无'}<br/>
      <b>关联报警:</b> ${row.alarm_desc || '人工建单'}<br/>
      <b>处理结果:</b> ${row.result_desc || '<span style="color:gray">暂无</span>'}
    </div>
  `, '工单详情', { dangerouslyUseHTMLString: true })
}

onMounted(() => {
  fetchData()
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
.highlight-text {
  color: #00d8ff;
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.dark-tag {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
}
.danger-tag {
  background-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
  border: none;
}
.warning-tag {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: none;
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-warning { color: #f59e0b; }
.status-warning .dot { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
.status-primary { color: #00d8ff; }
.status-primary .dot { background-color: #00d8ff; box-shadow: 0 0 8px #00d8ff; }
.status-success { color: #10b981; }
.status-success .dot { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
.priority-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.priority-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.priority-high { color: #f43f5e; }
.priority-high .dot { background-color: #f43f5e; box-shadow: 0 0 6px #f43f5e; }
.priority-medium { color: #f59e0b; }
.priority-medium .dot { background-color: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.priority-low { color: #94a3b8; }
.priority-low .dot { background-color: #94a3b8; }
.handler-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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
:deep(.glass-input .el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #e2e8f0;
}
:deep(.glass-input .el-input__wrapper:hover),
:deep(.glass-input .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}
:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}
:deep(.glass-select .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-select .el-input__inner) {
  color: #e2e8f0;
}
</style>
