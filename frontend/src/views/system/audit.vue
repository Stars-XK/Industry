<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>安全审计与操作日志</span>
      </div>
      
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="日志ID" width="100" align="center" />
        <el-table-column prop="user_id" label="操作人ID" width="100" align="center" />
        <el-table-column prop="ip_address" label="来源 IP" width="150" />
        <el-table-column prop="req_method" label="请求方法" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTag(row.req_method)">{{ row.req_method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="req_url" label="请求路径" />
        <el-table-column label="耗时(ms)" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.execution_time > 1000 ? 'red' : 'inherit' }">
              {{ row.execution_time }} ms
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="操作时间" width="180" align="center">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">查看参数</el-button>
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
        />
      </div>
    </el-card>

    <el-dialog title="请求参数详情 (已脱敏)" v-model="dialogVisible" width="600px">
      <div v-if="currentLog" style="background-color: #f5f7fa; padding: 15px; border-radius: 4px;">
        <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0;">{{ formatJson(currentLog.req_body) }}</pre>
      </div>
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

const getMethodTag = (method: string) => {
  switch (method) {
    case 'GET': return ''
    case 'POST': return 'success'
    case 'PUT': return 'warning'
    case 'DELETE': return 'danger'
    default: return 'info'
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
.app-container {
  padding: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
