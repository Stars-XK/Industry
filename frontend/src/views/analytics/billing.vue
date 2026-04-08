<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>营收计费与出账对账管理</span>
          <el-button type="primary" @click="handleGenerate">生成新账单</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="账单编号" width="100" />
        <el-table-column prop="account_no" label="大用户号" width="150" />
        <el-table-column prop="account_name" label="用户名称" />
        <el-table-column prop="billing_period" label="账期" width="120" />
        <el-table-column prop="usage_m3" label="用水量 (m³)" width="150" />
        <el-table-column prop="tariff_name" label="适用费率" width="150" />
        <el-table-column prop="total_amount" label="总金额 (元)" width="150">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'paid' ? 'success' : 'danger'">
              {{ scope.row.status === 'paid' ? '已缴费' : '未缴费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'unpaid'" 
              size="small" 
              type="success" 
              @click="handlePay(scope.row)">
              确认销账
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const tableData = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/billing/records')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleGenerate = () => {
  ElMessageBox.prompt('请输入要生成的账期 (如 2026-05)', '生成账单', {
    confirmButtonText: '生成',
    cancelButtonText: '取消',
    inputPattern: /^\d{4}-\d{2}$/,
    inputErrorMessage: '格式不正确，需为 YYYY-MM'
  }).then(async ({ value }) => {
    try {
      await request.post('/api/data-center/billing/records/generate', { period: value })
      ElMessage.success('生成成功')
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const handlePay = async (row: any) => {
  try {
    await request.put(`/api/data-center/billing/records/${row.id}/pay`)
    ElMessage.success('销账成功')
    fetchData()
  } catch (e) {}
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
