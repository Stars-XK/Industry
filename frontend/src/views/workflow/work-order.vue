<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>运维工单流转大盘 (O&M Work Orders)</span>
          <el-button type="primary" @click="handleAdd">手工创建工单</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="order_sn" label="工单编号" width="180">
          <template #default="scope">
            <span style="font-family: monospace; font-weight: bold;">{{ scope.row.order_sn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="任务标题" width="220" />
        <el-table-column prop="order_type" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.order_type === 1" type="info">巡检</el-tag>
            <el-tag v-else-if="scope.row.order_type === 2" type="danger">抢修</el-tag>
            <el-tag v-else-if="scope.row.order_type === 3" type="warning">听漏</el-tag>
            <el-tag v-else>保养</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.priority >= 3 ? 'danger' : 'info'" effect="plain">
              {{ scope.row.priority === 4 ? '紧急' : (scope.row.priority === 3 ? '高' : '中') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler_name" label="当前处理人" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.handler_name" type="success" effect="dark"><el-icon><User /></el-icon> {{ scope.row.handler_name }}</el-tag>
            <span v-else class="text-gray-400">待派发</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="流转状态" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 10" type="warning" effect="dark">待接单</el-tag>
            <el-tag v-else-if="scope.row.status === 20" type="primary" effect="dark">处理中</el-tag>
            <el-tag v-else-if="scope.row.status === 30" type="success" effect="dark">已闭环</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 10" size="small" type="primary" link @click="handleAccept(scope.row)">指派接单</el-button>
            <el-button v-if="scope.row.status === 20" size="small" type="success" link @click="handleClose(scope.row)">提交闭环</el-button>
            <el-button size="small" type="info" link @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="指派处理人" v-model="assignDialogVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="接单人">
          <el-select v-model="assignHandlerId" filterable placeholder="请选择维修工/处理人" style="width: 100%">
            <el-option v-for="u in usersOptions" :key="u.id" :label="`${u.nickname} (${u.username})`" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssign">确认派发</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="工单闭环" v-model="closeDialogVisible" width="500px">
      <el-form label-width="80px">
        <el-form-item label="处理结果">
          <el-input type="textarea" v-model="closeResultDesc" :rows="4" placeholder="请详细描述故障原因及修复过程..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialogVisible = false">取消</el-button>
          <el-button type="success" @click="submitClose">提交归档</el-button>
        </span>
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
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
