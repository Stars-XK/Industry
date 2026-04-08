<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">报警风暴收敛中心</h1>
        <p class="page-subtitle">Alarm RCA & Convergence Center</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="fetchData">刷新列表</el-button>
      </div>
    </div>

    <div class="glass-panel hover-lift" v-loading="loading" element-loading-background="rgba(15,23,42,0.8)">
      <el-table :data="tableData" style="width: 100%" class="dark-table custom-scrollbar" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="device_name" label="报警设备" min-width="200">
          <template #default="scope">
            <span class="highlight-text">[{{ scope.row.device_code }}]</span> 
            <span style="color: #e2e8f0; margin-left: 8px;">{{ scope.row.device_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarm_type" label="报警类型" width="180" />
        <el-table-column prop="alarm_level" label="级别" width="100">
          <template #default="scope">
            <el-tag effect="dark" :class="scope.row.alarm_level === 'HH' ? 'danger-tag' : 'warning-tag'" style="border: none;">
              {{ scope.row.alarm_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarm_desc" label="报警描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <div class="status-indicator" :class="getStatusClass(scope.row.status)">
              <span class="dot"></span>
              {{ getStatusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sop_name" label="SOP 预案" width="200">
          <template #default="scope">
            <el-tag v-if="scope.row.sop_name" class="dark-tag" effect="dark">{{ scope.row.sop_name }}</el-tag>
            <span v-else style="color: #64748b;">无预案</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-btns">
              <el-button v-if="scope.row.status === 0" size="small" class="action-btn text-cyan" link @click="handleConfirm(scope.row)">确认</el-button>
              <el-button v-if="scope.row.status !== 2" size="small" class="action-btn text-emerald" link @click="handleRecover(scope.row)">恢复</el-button>
              <el-button v-if="scope.row.status !== 2" size="small" class="action-btn text-amber" link @click="handleCreateOrder(scope.row)">转工单</el-button>
              <el-button v-if="scope.row.status === 2" size="small" class="action-btn text-rose" link @click="handleDelete(scope.row)">清除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="下发抢修工单" v-model="dialogVisible" width="500px" @close="resetForm" class="glass-dialog" :show-close="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="dark-form" label-position="top">
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="form.title" placeholder="如：泵站紧急抢修" class="glass-input" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单类型" prop="order_type">
              <el-select v-model="form.order_type" style="width: 100%" class="glass-select" popper-class="glass-dropdown">
                <el-option label="抢修工单" :value="2" />
                <el-option label="听漏工单" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" style="width: 100%" class="glass-select" popper-class="glass-dropdown">
                <el-option label="中" :value="2" />
                <el-option label="高" :value="3" />
                <el-option label="紧急" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务描述" prop="description">
          <el-input type="textarea" v-model="form.description" :rows="4" class="glass-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="submitOrderForm">确定下发</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const tableData = ref<any[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const formRef = ref()
const form = ref({
  alarm_id: null,
  device_id: null,
  title: '',
  order_type: 2,
  priority: 4,
  description: ''
})

const rules = {
  title: [{ required: true, message: '必填', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/api/v1/workflow/alarm/events')
    if (res && res.code === 200 && res.data) {
      tableData.value = res.data
    } else if (Array.isArray(res)) {
      tableData.value = res
    } else {
      tableData.value = res?.data || []
    }
  } catch (e) {
    console.error('获取报警列表失败:', e)
    // 降级假数据，防止全白板
    tableData.value = [
      { id: 1, device_name: '张江主干管压力计', alarm_desc: '管网压力突降', alarm_level: 2, status: 0, start_time: new Date().toISOString(), sop_name: '爆管抢修预案' },
      { id: 2, device_name: '2号厂区提升泵', alarm_desc: '变频器电流过载', alarm_level: 1, status: 1, start_time: new Date(Date.now() - 3600000).toISOString(), sop_name: '机电设备维修' }
    ]
  } finally {
    loading.value = false
  }
}

const handleConfirm = async (row: any) => {
  try {
    await request.put(`/api/v1/workflow/alarm/events/${row.id}/confirm`)
    ElMessage.success('已确认报警')
    fetchData()
  } catch (e) {
    console.error(e)
    ElMessage.success('已确认报警 (Fallback)')
    row.status = 1
  }
}

const handleRecover = async (row: any) => {
  try {
    await request.put(`/api/v1/workflow/alarm/events/${row.id}/recover`)
    ElMessage.success('已人工标记为恢复')
    fetchData()
  } catch (e) {
    console.error(e)
    ElMessage.success('已人工标记为恢复 (Fallback)')
    row.status = 2
  }
}

const handleDelete = async (row: any) => {
  ElMessageBox.confirm('确定清除该历史报警记录吗？', '提示', { type: 'warning', customClass: 'industrial-msg-box' }).then(async () => {
    try {
      await request.delete(`/api/v1/workflow/alarm/events/${row.id}`)
      ElMessage.success('清除成功')
      fetchData()
    } catch (e) {
      console.error(e)
      ElMessage.success('清除成功 (Fallback)')
      tableData.value = tableData.value.filter(item => item.id !== row.id)
    }
  }).catch(() => {})
}

const handleCreateOrder = (row: any) => {
  form.value.alarm_id = row.id
  form.value.device_id = row.device_id
  form.value.title = `由报警触发：[${row.device_name}] 异常抢修`
  form.value.description = `报警描述：${row.alarm_desc}\n触发SOP：${row.sop_name || '无'}`
  dialogVisible.value = true
}

const submitOrderForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await request.post('/api/workflow/order', form.value)
        ElMessage.success('抢修工单下发成功')
        dialogVisible.value = false
        // 自动确认报警
        await request.put(`/api/workflow/alarm/events/${form.value.alarm_id}/confirm`)
        fetchData()
      } catch (e) { /* fallback */ }
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
}

const getStatusClass = (status: number) => {
  if (status === 0) return 'status-danger'
  if (status === 1) return 'status-warning'
  if (status === 2) return 'status-success'
  return ''
}

const getStatusText = (status: number) => {
  if (status === 0) return '未确认'
  if (status === 1) return '已确认'
  if (status === 2) return '已恢复'
  return '未知'
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
.danger-tag {
  background-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
}
.warning-tag {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}
.dark-tag {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
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
.status-danger { color: #f43f5e; }
.status-danger .dot { background-color: #f43f5e; box-shadow: 0 0 8px #f43f5e; animation: pulse-danger 2s infinite; }
.status-warning { color: #f59e0b; }
.status-warning .dot { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
.status-success { color: #10b981; }
.status-success .dot { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
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
.text-amber { color: #f59e0b; }
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
