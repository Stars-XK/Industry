<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>大用户档案与重点企业画像</span>
          <el-button type="primary" @click="handleAdd">新增档案</el-button>
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
        <el-form-item label="企业编号" prop="account_no">
          <el-input v-model="form.account_no" :disabled="!!form.id" placeholder="如 KA-2026-0005" />
        </el-form-item>
        <el-form-item label="企业名称" prop="account_name">
          <el-input v-model="form.account_name" placeholder="请输入企业全称" />
        </el-form-item>
        <el-form-item label="行业分类" prop="industry_type">
          <el-select v-model="form.industry_type" placeholder="请选择" style="width: 100%">
            <el-option label="半导体制造" value="半导体制造" />
            <el-option label="汽车制造" value="汽车制造" />
            <el-option label="商业综合体" value="商业综合体" />
            <el-option label="软件及服务" value="软件及服务" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="企业地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="绑定水表ID" prop="meter_device_id">
          <el-input-number v-model="form.meter_device_id" :min="1" style="width: 100%" placeholder="填写 ast_device 的 ID" />
        </el-form-item>
        <el-form-item label="适用费率ID" prop="tariff_id">
          <el-input-number v-model="form.tariff_id" :min="1" style="width: 100%" placeholder="填写 biz_tariff 的 ID" />
        </el-form-item>
        <el-form-item label="状态" v-if="form.id">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="正常" inactive-text="停用" />
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
const dialogTitle = ref('新增档案')
const formRef = ref()
const form = ref({
  id: '',
  account_no: '',
  account_name: '',
  contact: '',
  phone: '',
  address: '',
  industry_type: '',
  tariff_id: 1,
  meter_device_id: null,
  status: 1
})

const rules = {
  account_no: [{ required: true, message: '必填', trigger: 'blur' }],
  account_name: [{ required: true, message: '必填', trigger: 'blur' }],
  tariff_id: [{ required: true, message: '必须绑定费率', trigger: 'change' }]
}

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

const handleAdd = () => {
  dialogTitle.value = '新增档案'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑档案'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该大用户档案吗？如果已有账单产生将无法硬删除。', '高危操作确认', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/billing/accounts/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {
      // 错误由全局拦截器处理提示
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/data-center/billing/accounts/${form.value.id}`, form.value)
        } else {
          await request.post('/api/data-center/billing/accounts', form.value)
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
  form.value.status = 1
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
</style>
