<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据清洗与插值规则配置 (Data Cleaning & Interpolation)</span>
          <el-button type="danger" @click="handleRecalculate">⚠️ 历史数据重算</el-button>
        </div>
      </template>

      <el-alert
        title="工业级时间序列重算警告：修改插值规则或执行重算，将直接影响下游 DMA 产销差及营收计费模型，请在夜间低峰期执行！"
        type="warning"
        show-icon
        style="margin-bottom: 20px;"
      />

      <el-table :data="tableData" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="规则 ID" width="100" />
        <el-table-column prop="device_name" label="目标设备" width="200" />
        <el-table-column prop="tag_name" label="时序标签 (Tag)" width="150" />
        <el-table-column prop="method" label="插值算法 (Method)" width="180">
          <template #default="scope">
            <el-tag :type="getMethodType(scope.row.method)">{{ getMethodName(scope.row.method) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="max_gap_minutes" label="最大允许间隙 (分钟)" width="180">
          <template #default="scope">
            <span style="font-weight: bold; color: #409EFF">{{ scope.row.max_gap_minutes }} Min</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="规则状态" width="120">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" disabled />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" plain disabled>修改规则</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="提交时序重算作业" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="目标设备ID">
          <el-input v-model="form.deviceId" placeholder="例如: 1" />
        </el-form-item>
        <el-form-item label="时序标签 (Tag)">
          <el-input v-model="form.tag" placeholder="例如: flow_rate" />
        </el-form-item>
        <el-form-item label="强制插值算法">
          <el-select v-model="form.method" placeholder="选择算法" style="width: 100%">
            <el-option label="PCHIP (保调三次分段)" value="pchip" />
            <el-option label="Linear (线性插值)" value="linear" />
            <el-option label="Previous (前值填充)" value="previous" />
            <el-option label="Zero (补零)" value="zero" />
          </el-select>
        </el-form-item>
        <el-form-item label="重算时间范围">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="submitRecalculate">确认并强制提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)

const form = ref({
  deviceId: '',
  tag: '',
  method: 'pchip',
  dateRange: []
})

const getMethodType = (method: string) => {
  const map: Record<string, string> = { 'pchip': 'success', 'linear': 'primary', 'previous': 'warning', 'zero': 'info' }
  return map[method] || 'info'
}

const getMethodName = (method: string) => {
  const map: Record<string, string> = { 'pchip': 'PCHIP (保调三次)', 'linear': 'Linear (线性)', 'previous': 'Previous (前值)', 'zero': 'Zero (补零)' }
  return map[method] || method
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/governance/interpolate/rules')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleRecalculate = () => {
  dialogVisible.value = true
}

const submitRecalculate = async () => {
  if (!form.value.deviceId || !form.value.tag || form.value.dateRange.length !== 2) {
    ElMessage.warning('请完整填写重算参数')
    return
  }
  
  try {
    const res = await request.post('/api/data-center/governance/interpolate/recalculate', {
      deviceId: Number(form.value.deviceId),
      tag: form.value.tag,
      method: form.value.method,
      startTime: form.value.dateRange[0],
      endTime: form.value.dateRange[1]
    })
    ElMessage.success(`重算任务已提交！作业ID: ${res.taskId}`)
    dialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
