<template>
  <div class="page-container">
    <div class="toolbar">
      <h2>安全审计与脱敏日志</h2>
      <el-button type="primary" @click="getList" :icon="Refresh">刷新</el-button>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
      element-loading-text="Thinking..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="user_id" label="操作人ID" width="100" />
      <el-table-column prop="ip_address" label="IP地址" width="140" />
      <el-table-column prop="req_method" label="请求方式" width="100">
        <template #default="{ row }">
          <el-tag :type="getMethodTag(row.req_method)">{{ row.req_method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="req_url" label="请求路径" min-width="200" show-overflow-tooltip />
      <el-table-column prop="execution_time" label="耗时(ms)" width="100">
        <template #default="{ row }">
          <el-tag type="info">{{ row.execution_time }} ms</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="操作时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewDetails(row)">查看参数</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="getList"
      />
    </div>

    <!-- 查看参数弹窗 -->
    <el-dialog title="请求参数详情" v-model="dialogVisible" width="600px">
      <pre class="json-viewer">{{ selectedBody }}</pre>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(15)
const total = ref(0)

const dialogVisible = ref(false)
const selectedBody = ref('')

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/system/audit/list', {
      params: { page: page.value, size: size.value }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewDetails = (row: any) => {
  selectedBody.value = JSON.stringify(row.req_body, null, 2) || '无参数'
  dialogVisible.value = true
}

const getMethodTag = (method: string) => {
  switch (method?.toUpperCase()) {
    case 'GET': return 'success'
    case 'POST': return 'warning'
    case 'PUT': return 'primary'
    case 'DELETE': return 'danger'
    default: return 'info'
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fff;
  height: 100%;
  border-radius: 4px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.json-viewer {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  font-family: Consolas, Monaco, monospace;
}
</style>
