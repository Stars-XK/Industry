<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>班组排班与考勤调度</span>
          <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" value-format="YYYY-MM" @change="fetchData" :clearable="false" />
        </div>
      </template>

      <el-calendar :v-model="currentDate">
        <template #date-cell="{ data }">
          <div style="height: 100%; display: flex; flex-direction: column;">
            <div style="font-weight: bold; margin-bottom: 5px;">{{ data.day.split('-').slice(2).join('') }}</div>
            <div style="flex: 1; overflow-y: auto; font-size: 12px;">
              <div v-for="item in getDutiesByDate(data.day)" :key="item.id" 
                   style="margin-bottom: 2px; padding: 2px; border-radius: 2px;"
                   :style="{ background: item.is_attended ? '#f0f9eb' : '#fdf6ec', color: item.is_attended ? '#67c23a' : '#e6a23c' }">
                [{{ getShiftName(item.shift_type) }}] {{ item.nickname }}
                <el-button v-if="!item.is_attended" type="success" link size="small" @click.stop="markAttend(item.id)">打卡</el-button>
              </div>
            </div>
            <div style="text-align: right;">
              <el-button type="primary" link size="small" @click.stop="handleAdd(data.day)">+ 排班</el-button>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>

    <el-dialog title="新增排班" v-model="dialogVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="日期">
          <el-input :model-value="form.duty_date" disabled />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="form.shift_type" style="width: 100%">
            <el-option label="早班 (08:00-16:00)" value="morning" />
            <el-option label="中班 (16:00-00:00)" value="afternoon" />
            <el-option label="夜班 (00:00-08:00)" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="值班人">
          <el-select v-model="form.user_id" filterable style="width: 100%">
            <el-option v-for="u in usersOptions" :key="u.id" :label="u.nickname" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定排班</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const currentDate = ref(new Date())
const currentMonth = ref(new Date().toISOString().slice(0, 7))
const scheduleList = ref<any[]>([])

const usersOptions = ref<any[]>([])
const dialogVisible = ref(false)
const form = ref({ user_id: null, duty_date: '', shift_type: 'morning' })

const fetchData = async () => {
  try {
    scheduleList.value = await request.get('/api/workflow/duty/schedule', { params: { month: currentMonth.value } }) || []
  } catch (e) {}
}

const fetchOptions = async () => {
  try {
    usersOptions.value = await request.get('/api/workflow/order/options/users') || []
  } catch (e) {}
}

const getDutiesByDate = (date: string) => {
  return scheduleList.value.filter(item => item.duty_date.startsWith(date))
}

const getShiftName = (type: string) => {
  const map: Record<string, string> = { 'morning': '早班', 'afternoon': '中班', 'night': '夜班' }
  return map[type] || type
}

const handleAdd = (date: string) => {
  form.value = { user_id: null, duty_date: date, shift_type: 'morning' }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.value.user_id) return ElMessage.warning('请选择值班人')
  try {
    await request.post('/api/workflow/duty/schedule', form.value)
    ElMessage.success('排班成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const markAttend = async (id: number) => {
  try {
    await request.put(`/api/workflow/duty/schedule/${id}/attend`)
    ElMessage.success('打卡成功')
    fetchData()
  } catch (e) {}
}

onMounted(() => {
  fetchData()
  fetchOptions()
})
</script>
<style scoped>
.page-container { padding: 20px; }
</style>
