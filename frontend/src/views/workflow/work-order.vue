<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">运维工单流转大盘</h1>
        <p class="page-subtitle">O&M Work Order Lifecycle Management</p>
      </div>
      <div class="header-actions">
        <el-button  @click="handleAdd">手工创建工单</el-button>
      </div>
    </div>
    <div class="box-card" style="padding: 20px; flex: 1;">
      <el-table :data="tableData" style="width: 100%" class="custom-table custom-scrollbar" v-loading="loading" >
        <el-table-column prop="order_sn" label="工单编号" width="180" show-overflow-tooltip>
          <template #default="scope">
            <span class="highlight-text">{{ scope.row.order_sn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="任务标题" min-width="220" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-text-color-primary); font-weight: 500;">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="order_type" label="类型" width="100" show-overflow-tooltip>
          <template #default="scope">
            <el-tag v-if="scope.row.order_type === 1" effect="dark" class="dark-tag">巡检</el-tag>
            <el-tag v-else-if="scope.row.order_type === 2" effect="dark" class="danger-tag">抢修</el-tag>
            <el-tag v-else-if="scope.row.order_type === 3" effect="dark" class="warning-tag">听漏</el-tag>
            <el-tag v-else effect="dark" class="dark-tag">保养</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" show-overflow-tooltip>
          <template #default="scope">
            <div class="priority-indicator" :class="scope.row.priority >= 4 ? 'priority-high' : (scope.row.priority === 3 ? 'priority-medium' : 'priority-low')">
              <span class="dot"></span>
              {{ scope.row.priority === 4 ? '紧急' : (scope.row.priority === 3 ? '高' : '中') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="handler_name" label="当前处理人" width="140" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.handler_name" class="handler-badge">
              <el-icon><User /></el-icon> {{ scope.row.handler_name }}
            </div>
            <span v-else style="color: var(--el-border-color);">待派发</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="流转状态" width="120" show-overflow-tooltip>
          <template #default="scope">
            <div class="status-indicator" :class="getStatusClass(scope.row.status)">
              <span class="dot"></span>
              {{ getStatusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" show-overflow-tooltip>
          <template #default="scope">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">
              {{ new Date(scope.row.created_at).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" show-overflow-tooltip>
          <template #default="scope">
            <div class="action-btns">
              <el-button v-if="scope.row.status === 10" size="small" class="action-btn text-cyan" link @click="handleAccept(scope.row)">指派</el-button>
              <el-button v-if="scope.row.status === 20" size="small" class="action-btn text-emerald" link @click="handleClose(scope.row)">闭环</el-button>
              <el-button size="small" class="action-btn" style="color: var(--el-text-color-regular);" link @click="viewDetail(scope.row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog title="指派处理人" v-model="assignDialogVisible" width="400px"  :show-close="false">
      <el-form label-width="80px"  label-position="top">
        <el-form-item label="接单人">
          <el-select v-model="assignHandlerId" filterable placeholder="请选择维修工/处理人" style="width: 100%"  popper-class="glass-dropdown">
            <el-option v-for="u in usersOptions" :key="u.id" :label="`${u.nickname} (${u.username})`" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false" >取消</el-button>
          <el-button  @click="submitAssign">确认派发</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="工单闭环" v-model="closeDialogVisible" width="500px"  :show-close="false">
      <el-form label-width="80px"  label-position="top">
        <el-form-item label="处理结果">
          <el-input type="textarea" v-model="closeResultDesc" :rows="4" placeholder="请详细描述故障原因及修复过程…"  />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialogVisible = false" >取消</el-button>
          <el-button  style="border-color: var(--el-color-success); color: var(--el-color-success);" @click="submitClose">提交归档</el-button>
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
    const res = await request.get('/api/v1/workflow/order/list')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const fetchOptions = async () => {
  try {
    usersOptions.value = await request.get('/api/v1/workflow/order/options/users') || []
  } catch (e) { /* fallback */ }
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
    await request.put(`/api/v1/workflow/order/${currentOrder.value.id}/accept`, { handler_id: assignHandlerId.value })
    ElMessage.success('指派成功，工单已流转至处理中状态')
    assignDialogVisible.value = false
    fetchData()
  } catch (e) { /* fallback */ }
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
    await request.put(`/api/v1/workflow/order/${currentOrder.value.id}/close`, { result_desc: closeResultDesc.value })
    ElMessage.success('工单已成功闭环')
    closeDialogVisible.value = false
    fetchData()
  } catch (e) { /* fallback */ }
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
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin: 0;
  letter-spacing: 0.5px;
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

.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.custom-table {
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color-light);
}

.highlight-text {
  color: var(--el-color-primary);
  font-family: "SF Mono", monospace;
  font-weight: 600;
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
.status-warning { color: var(--el-color-warning); }
.status-warning .dot { background-color: var(--el-color-warning); box-shadow: 0 0 8px var(--el-color-warning-light-5); }
.status-primary { color: var(--el-color-primary); }
.status-primary .dot { background-color: var(--el-color-primary); box-shadow: 0 0 8px var(--el-color-primary-light-5); }
.status-success { color: var(--el-color-success); }
.status-success .dot { background-color: var(--el-color-success); box-shadow: 0 0 8px var(--el-color-success-light-5); }

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
.priority-high { color: var(--el-color-danger); }
.priority-high .dot { background-color: var(--el-color-danger); box-shadow: 0 0 6px var(--el-color-danger-light-5); }
.priority-medium { color: var(--el-color-warning); }
.priority-medium .dot { background-color: var(--el-color-warning); box-shadow: 0 0 6px var(--el-color-warning-light-5); }
.priority-low { color: var(--el-text-color-regular); }
.priority-low .dot { background-color: var(--el-text-color-regular); }

.handler-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  color: var(--el-color-success);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.action-btns {
  display: flex;
  gap: 12px;
}
.text-cyan { color: var(--el-color-primary); }
.text-emerald { color: var(--el-color-success); }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
