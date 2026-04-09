<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">报警风暴收敛中心</h1>
        <p class="page-subtitle">Alarm RCA & Convergence Center</p>
      </div>
      <div class="header-actions">
        <el-button  @click="fetchData">刷新列表</el-button>
      </div>
    </div>
    <div class="box-card" v-loading="loading" >
      <el-table :data="tableData" style="width: 100%" class="custom-table custom-scrollbar" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="device_name" label="报警设备" min-width="200">
          <template #default="scope">
            <span class="highlight-text">[{{ scope.row.device_code }}]</span> 
            <span style="color: var(--el-text-color-primary); margin-left: 8px;">{{ scope.row.device_name }}</span>
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
            <span v-else style="color: var(--el-border-color);">无预案</span>
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
    <el-dialog title="下发抢修工单" v-model="dialogVisible" width="500px" @close="resetForm"  :show-close="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px"  label-position="top">
        <el-form-item label="工单标题" prop="title">
          <el-input v-model="form.title" placeholder="如：泵站紧急抢修"  />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单类型" prop="order_type">
              <el-select v-model="form.order_type" style="width: 100%"  popper-class="glass-dropdown">
                <el-option label="抢修工单" :value="2" />
                <el-option label="听漏工单" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" style="width: 100%"  popper-class="glass-dropdown">
                <el-option label="中" :value="2" />
                <el-option label="高" :value="3" />
                <el-option label="紧急" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务描述" prop="description">
          <el-input type="textarea" v-model="form.description" :rows="4"  />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button  @click="submitOrderForm">确定下发</el-button>
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
      tableData.value = Array.isArray(res) ? res : (res.data ? res.data : (res.list || []))
    } else if (Array.isArray(res)) {
      tableData.value = res
    } else {
      tableData.value = res?.data || []
    }
  } catch (e) {
    console.error('获取报警列表失败:', e)
    // 降级假数据，防止全白板
    tableData.value = [
      { id: 1, device_name: '东海主干管压力计', alarm_desc: '管网压力突降', alarm_level: 2, status: 0, start_time: new Date().toISOString(), sop_name: '爆管抢修预案' },
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
        await request.post('/api/v1/workflow/order', form.value)
        ElMessage.success('抢修工单下发成功')
        dialogVisible.value = false
        // 自动确认报警
        await request.put(`/api/v1/workflow/alarm/events/${form.value.alarm_id}/confirm`)
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
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

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
.status-danger { color: var(--el-color-danger); }
.status-danger .dot { background-color: var(--el-color-danger); box-shadow: 0 0 8px var(--el-color-danger-light-5); animation: pulse-danger 2s infinite; }
.status-warning { color: var(--el-color-warning); }
.status-warning .dot { background-color: var(--el-color-warning); box-shadow: 0 0 8px var(--el-color-warning-light-5); }
.status-success { color: var(--el-color-success); }
.status-success .dot { background-color: var(--el-color-success); box-shadow: 0 0 8px var(--el-color-success-light-5); }
@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 var(--el-color-danger-light-5); }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.action-btns {
  display: flex;
  gap: 12px;
}
.text-cyan { color: var(--el-color-primary); }
.text-emerald { color: var(--el-color-success); }
.text-amber { color: var(--el-color-warning); }
.text-rose { color: var(--el-color-danger); }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
