<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">班组排班与考勤调度</h1>
        <p class="page-subtitle">Duty Roster & Attendance Scheduling</p>
      </div>
      <div class="header-actions">
        <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" value-format="YYYY-MM" @change="fetchData" :clearable="false" class="glass-date-picker" popper-class="glass-dropdown" />
      </div>
    </div>

    <div class="glass-panel hover-lift" style="padding: 20px;">
      <el-calendar v-model="currentDate" class="dark-calendar">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <div class="calendar-day">{{ data.day.split('-').slice(2).join('') }}</div>
            <div class="duty-list custom-scrollbar">
              <div v-for="item in getDutiesByDate(data.day)" :key="item.id" 
                   class="duty-item"
                   :class="item.is_attended ? 'duty-attended' : 'duty-pending'">
                <div class="duty-info">
                  <span class="duty-shift">[{{ getShiftName(item.shift_type) }}]</span> 
                  <span class="duty-name">{{ item.nickname }}</span>
                </div>
                <el-button v-if="!item.is_attended" class="action-btn text-emerald" link size="small" @click.stop="markAttend(item.id)">打卡</el-button>
              </div>
            </div>
            <div class="calendar-action">
              <el-button class="action-btn text-cyan" link size="small" @click.stop="handleAdd(data.day)">+ 排班</el-button>
            </div>
          </div>
        </template>
      </el-calendar>
    </div>

    <el-dialog title="新增排班" v-model="dialogVisible" width="400px" class="glass-dialog" :show-close="false">
      <el-form label-width="80px" class="dark-form" label-position="top">
        <el-form-item label="日期">
          <el-input :model-value="form.duty_date" disabled class="glass-input is-disabled" />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="form.shift_type" style="width: 100%" class="glass-select" popper-class="glass-dropdown">
            <el-option label="早班 (08:00-16:00)" value="morning" />
            <el-option label="中班 (16:00-00:00)" value="afternoon" />
            <el-option label="夜班 (00:00-08:00)" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="值班人">
          <el-select v-model="form.user_id" filterable style="width: 100%" class="glass-select" popper-class="glass-dropdown">
            <el-option v-for="u in usersOptions" :key="u.id" :label="u.nickname" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="submitForm">确定排班</el-button>
        </div>
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
.dark-calendar {
  background-color: transparent;
  --el-calendar-border: rgba(255, 255, 255, 0.05);
  --el-calendar-cell-width: 120px;
}
:deep(.el-calendar__header) {
  display: none;
}
:deep(.el-calendar-table) {
  height: 100%;
}
:deep(.el-calendar-table td) {
  border-color: rgba(255, 255, 255, 0.05);
  background-color: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
}
:deep(.el-calendar-table td.is-selected) {
  background-color: rgba(0, 216, 255, 0.05);
}
:deep(.el-calendar-table td:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}
:deep(.el-calendar-table th) {
  color: #94a3b8;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;
}
.calendar-day {
  font-family: "SF Mono", monospace;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}
.duty-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.duty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border-left: 2px solid transparent;
}
.duty-info {
  display: flex;
  align-items: center;
  gap: 4px;
}
.duty-shift {
  color: #94a3b8;
  font-family: "SF Mono", monospace;
}
.duty-name {
  font-weight: 500;
}
.duty-attended {
  background: rgba(16, 185, 129, 0.1);
  border-left-color: #10b981;
  color: #10b981;
}
.duty-pending {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: #f59e0b;
  color: #f59e0b;
}
.calendar-action {
  text-align: right;
  margin-top: 4px;
}
.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
}
.text-cyan { color: #00d8ff; }
.text-emerald { color: #10b981; }
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
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
:deep(.glass-input.is-disabled .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}
:deep(.glass-input .el-input__wrapper:hover:not(.is-disabled)),
:deep(.glass-input .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}
:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}
:deep(.glass-select .el-input__wrapper),
:deep(.glass-date-picker .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-select .el-input__inner),
:deep(.glass-input .el-input__inner),
:deep(.glass-date-picker .el-input__inner) {
  color: #e2e8f0;
}
:deep(.glass-input.is-disabled .el-input__inner) {
  color: #94a3b8;
}
</style>
