<template>
  <div class="premium-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">安全审计与脱敏日志</h1>
        <p class="page-subtitle">Security Audit & Data Masking Logs</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="getList">刷新记录</el-button>
      </div>
    </div>
    
    <div class="glass-panel" style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
      <el-table v-loading="loading" :data="list" style="width: 100%" class="dark-table custom-scrollbar" element-loading-background="rgba(15,23,42,0.8)">
        <el-table-column prop="id" label="日志ID" width="100" align="center" />
        <el-table-column prop="user_id" label="操作人ID" width="100" align="center">
          <template #default="{ row }">
            <span class="highlight-text">{{ row.user_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="来源 IP" width="150">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ row.ip_address }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="req_method" label="请求方法" width="100" align="center">
          <template #default="{ row }">
            <el-tag :class="getMethodClass(row.req_method)" effect="dark" style="border: none; font-family: 'SF Mono', monospace;">{{ row.req_method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="req_url" label="请求路径">
          <template #default="{ row }">
            <span style="color: #e2e8f0; font-family: 'SF Mono', monospace;">{{ row.req_url }}</span>
          </template>
        </el-table-column>
        <el-table-column label="耗时(ms)" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.execution_time > 1000 ? '#f43f5e' : '#10b981', fontFamily: 'SF Mono, monospace' }">
              {{ row.execution_time }} ms
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="操作时间" width="180" align="center">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
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

    <el-dialog title="请求参数详情 (已脱敏)" v-model="dialogVisible" width="600px" class="glass-dialog" :show-close="false">
      <div v-if="currentLog" class="json-viewer custom-scrollbar">
        <pre>{{ formatJson(currentLog.req_body) }}</pre>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">关闭</el-button>
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
      url: '/api/system/audit/list',
      method: 'get',
      params: listQuery
    })
    list.value = data.records
    total.value = data.total
  } catch (error) {
    console.error(error)
  }
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
.dark-tag { background: rgba(255, 255, 255, 0.1); color: #cbd5e1; border: none; }
.cyan-tag { background: rgba(0, 216, 255, 0.1); color: #00d8ff; border: none; }
.emerald-tag { background: rgba(16, 185, 129, 0.1); color: #10b981; border: none; }
.amber-tag { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: none; }
.rose-tag { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: none; }
.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
  transform: translateY(-1px);
}
.text-cyan { color: #00d8ff; }
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
.json-viewer {
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}
.json-viewer pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: #10b981;
  font-family: "SF Mono", monospace;
  font-size: 13px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
:deep(.dark-pagination .el-pagination__total),
:deep(.dark-pagination .el-pagination__jump) {
  color: #94a3b8;
}
:deep(.dark-pagination button),
:deep(.dark-pagination .el-pager li) {
  background-color: transparent !important;
  color: #94a3b8;
}
:deep(.dark-pagination .el-pager li.is-active) {
  color: #00d8ff;
  font-weight: bold;
}
</style>
