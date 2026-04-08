<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>大用户档案与重点企业画像</span>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="account_no" label="大用户编号" width="150" />
        <el-table-column prop="account_name" label="企业名称" width="250" />
        <el-table-column prop="industry_type" label="行业分类" width="150">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.industry_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="address" label="企业地址" />
        <el-table-column prop="tariff_name" label="适用费率" width="150">
          <template #default="scope">
            <el-tooltip :content="`单价: ￥${scope.row.price_per_m3} / m³`" placement="top">
              <el-tag>{{ scope.row.tariff_name }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="meter_device_id" label="绑定水表ID" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const tableData = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/billing/accounts')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
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
