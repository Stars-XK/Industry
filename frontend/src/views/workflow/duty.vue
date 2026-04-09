<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">班组排班与考勤调度</h1>
        <p class="page-subtitle">Duty Roster & Attendance Scheduling</p>
      </div>
      <div class="header-actions">
        <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" value-format="YYYY-MM" @change="fetchData" :clearable="false" class="glass-date-picker" popper-class="glass-dropdown" />
      </div>
    </div>
    <div class="box-card" style="padding: 20px;">
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
    <el-dialog title="新增排班" v-model="dialogVisible" width="400px"  :show-close="false">
      <el-form label-width="80px"  label-position="top">
        <el-form-item label="日期">
          <el-input :model-value="form.duty_date" disabled class=" is-disabled" />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="form.shift_type" style="width: 100%"  popper-class="glass-dropdown">
            <el-option label="早班 (08:00-16:00)" value="morning" />
            <el-option label="中班 (16:00-00:00)" value="afternoon" />
            <el-option label="夜班 (00:00-08:00)" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="值班人">
          <el-select v-model="form.user_id" filterable style="width: 100%"  popper-class="glass-dropdown">
            <el-option v-for="u in usersOptions" :key="u.id" :label="u.nickname" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button  @click="submitForm">确定排班</el-button>
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
    scheduleList.value = await request.get('/api/v1/workflow/duty/schedule', { params: { month: currentMonth.value } }) || []
  } catch (e) { /* fallback */ }
}
const fetchOptions = async () => {
  try {
    usersOptions.value = await request.get('/api/v1/workflow/order/options/users') || []
  } catch (e) { /* fallback */ }
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
    await request.post('/api/v1/workflow/duty/schedule', form.value)
    ElMessage.success('排班成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) { /* fallback */ }
}
const markAttend = async (id: number) => {
  try {
    await request.put(`/api/v1/workflow/duty/schedule/${id}/attend`)
    ElMessage.success('打卡成功')
    fetchData()
  } catch (e) { /* fallback */ }
}
onMounted(() => {
  fetchData()
  fetchOptions()
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
.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;
}
.calendar-day {
  font-family: "SF Mono", monospace;
  font-weight: 600;
  color: var(--el-text-color-primary);
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
  color: var(--el-text-color-regular);
  font-family: "SF Mono", monospace;
}
.duty-name {
  font-weight: 500;
}
.duty-attended {
  background: var(--el-color-success-light-9);
  border-left-color: var(--el-color-success);
  color: var(--el-color-success);
}
.duty-pending {
  background: var(--el-color-warning-light-9);
  border-left-color: var(--el-color-warning);
  color: var(--el-color-warning);
}
.calendar-action {
  text-align: right;
  margin-top: 4px;
}
.text-cyan { color: var(--el-color-primary); }
.text-emerald { color: var(--el-color-success); }
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--el-fill-color-light);
}
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
