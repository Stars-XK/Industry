<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>阶梯水价与营收费率配置</span>
          <el-button type="primary" @click="handleAdd">新增费率</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="tariff_code" label="费率编码" width="180">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.tariff_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tariff_name" label="费率名称" width="200" />
        <el-table-column prop="price_per_m3" label="单价 (元/m³)" width="150">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.price_per_m3 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="适用说明" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="费率编码" prop="tariff_code">
          <el-input v-model="form.tariff_code" :disabled="!!form.id" placeholder="如 T_NEW" />
        </el-form-item>
        <el-form-item label="费率名称" prop="tariff_name">
          <el-input v-model="form.tariff_name" placeholder="如 新工业用水" />
        </el-form-item>
        <el-form-item label="单价(元/m³)" prop="price_per_m3">
          <el-input-number v-model="form.price_per_m3" :precision="4" :step="0.1" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="适用说明" prop="description">
          <el-input type="textarea" v-model="form.description" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const tableData = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('新增费率')
const formRef = ref()
const form = ref({
  id: '',
  tariff_code: '',
  tariff_name: '',
  price_per_m3: 0,
  description: '',
  status: 1
})

const rules = {
  tariff_code: [{ required: true, message: '必填', trigger: 'blur' }],
  tariff_name: [{ required: true, message: '必填', trigger: 'blur' }],
  price_per_m3: [{ required: true, message: '必填', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/billing/tariffs')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增费率'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑费率'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleStatusChange = async (row: any) => {
  try {
    await request.put(`/api/data-center/billing/tariffs/${row.id}`, row)
    ElMessage.success('状态已更新')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1 // revert
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该费率配置吗？如果已有企业档案绑定将无法删除。', '高危操作确认', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/billing/tariffs/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {
      // 错误由拦截器处理
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/data-center/billing/tariffs/${form.value.id}`, form.value)
        } else {
          await request.post('/api/data-center/billing/tariffs', form.value)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchData()
      } catch (e) {}
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  form.value.id = ''
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
