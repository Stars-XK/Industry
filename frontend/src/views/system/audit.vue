<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">安全审计与脱敏日志</h1>
        <p class="page-subtitle">Security Audit & Data Masking Logs</p>
      </div>
      <div class="header-actions">
        <el-button  @click="getList">刷新记录</el-button>
      </div>
    </div>
    <div class="box-card" style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
      <el-table v-loading="loading" :data="list" style="width: 100%" class="custom-table custom-scrollbar" >
        <el-table-column prop="id" label="日志ID" width="100" align="center"  show-overflow-tooltip />
        <el-table-column prop="user_id" label="操作人ID" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="highlight-text">{{ row.user_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="来源 IP" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ row.ip_address }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="req_method" label="请求方法" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag :class="getMethodClass(row.req_method)" effect="dark" style="border: none; font-family: 'SF Mono', monospace;">{{ row.req_method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="req_url" label="请求路径" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-text-color-primary); font-family: 'SF Mono', monospace;">{{ row.req_url }}</span>
          </template>
        </el-table-column>
        <el-table-column label="耗时(ms)" width="100" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span :style="{ color: row.execution_time > 1000 ? 'var(--el-color-danger)' : 'var(--el-color-success)', fontFamily: 'SF Mono, monospace' }">
              {{ row.execution_time }} ms
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="操作时间" width="180" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="100">
          <template #default="{ row }">
            <el-button class="action-btn text-cyan" link @click="showDetail(row)">查看参数</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.limit"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
          class="dark-pagination"
        />
      </div>
    </div>
    <el-dialog title="请求参数详情 (已脱敏)" v-model="dialogVisible" width="600px"  :show-close="false">
      <div v-if="currentLog" class="json-viewer custom-scrollbar">
        <pre>{{ formatJson(currentLog.req_body) }}</pre>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
const loading = ref(false)
const list = ref([])
const total = ref(0)
const listQuery = reactive({
  page: 1,
  limit: 20
})
const dialogVisible = ref(false)
const currentLog = ref<any>(null)
const getList = async () => {
  loading.value = true
  try {
    const { data } = await request({
      url: '/api/v1/system/audit/list',
      method: 'get',
      params: listQuery
    })
    list.value = data.records
    total.value = data.total
  } catch (e) { /* fallback */ }
  loading.value = false
}
const getMethodClass = (method: string) => {
  switch (method) {
    case 'GET': return 'cyan-tag'
    case 'POST': return 'emerald-tag'
    case 'PUT': return 'amber-tag'
    case 'DELETE': return 'rose-tag'
    default: return 'dark-tag'
  }
}
const showDetail = (row: any) => {
  currentLog.value = row
  dialogVisible.value = true
}
const formatJson = (val: any) => {
  if (!val) return '无参数'
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return String(val)
  }
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
.highlight-text {
  color: var(--el-color-primary);
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.cyan-tag { background: var(--el-color-primary-light-9); color: var(--el-color-primary); border: none; }
.emerald-tag { background: var(--el-color-success-light-9); color: var(--el-text-color-primary); border: none; }
.amber-tag { background: var(--el-color-warning-light-9); color: var(--el-color-warning); border: none; }
.rose-tag { background: var(--el-color-danger-light-9); color: var(--el-color-danger); border: none; }
.text-cyan { color: var(--el-color-primary); }
/* Table styles */
/* Dialog Styles */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.json-viewer {
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  padding: 16px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}
.json-viewer pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: var(--el-text-color-primary);
  font-family: "SF Mono", monospace;
  font-size: 13px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
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
