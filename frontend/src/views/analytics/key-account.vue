<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">大用户档案与重点企业画像</h1>
        <p class="page-subtitle">Key Account & Enterprise Profile Management</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增档案</el-button>
        <el-button @click="showImport = true" icon="Upload">批量导入</el-button>
      </div>
    </div>
    <div class="box-card">
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" class="industrial-table">
          <el-table-column prop="account_no" label="大用户编号" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="logic-text">{{ row.account_no }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="account_name" label="企业名称" width="250" show-overflow-tooltip>
            <template #default="{ row }">
              <span style="font-weight: 600; color: var(--el-text-color-primary);">{{ row.account_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="industry_type" label="行业分类" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-tag type="info" effect="dark" class="industrial-tag">{{ scope.row.industry_type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="contact" label="联系人" width="120"  show-overflow-tooltip />
          <el-table-column prop="phone" label="联系电话" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="logic-text" style="color: var(--el-text-color-regular);">{{ row.phone }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="企业地址" show-overflow-tooltip  />
          <el-table-column prop="tariff_name" label="适用费率" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-tooltip :content="`单价: ￥${scope.row.price_per_m3} / m³`" placement="top" effect="dark">
                <el-tag effect="plain" class="industrial-tag-plain">{{ scope.row.tariff_name }}</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="meter_device_name" label="绑定水表" width="180" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-tag type="success" effect="dark" class="industrial-tag" v-if="scope.row.meter_device_id">{{ scope.row.meter_device_name || '已绑定' }}</el-tag>
              <el-tag type="info" effect="plain" class="industrial-tag-plain" v-else>未绑定</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-button size="small" class="text-neon" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" class="text-danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" @close="resetForm" custom-class="industrial-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="industrial-form">
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
        <el-form-item label="绑定水表" prop="meter_device_id">
          <el-select v-model="form.meter_device_id" filterable clearable placeholder="请搜索并选择挂载的物理水表" style="width: 100%">
            <el-option
              v-for="item in deviceOptions"
              :key="item.id"
              :label="`[${item.device_code}] ${item.device_name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="适用费率" prop="tariff_id">
          <el-select v-model="form.tariff_id" placeholder="请选择适用费率" style="width: 100%">
            <el-option
              v-for="item in tariffOptions"
              :key="item.id"
              :label="`${item.tariff_name} (￥${item.price_per_m3}/m³)`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" v-if="form.id">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" class="industrial-switch" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button  style="border-color: var(--el-border-color); color: var(--el-text-color-regular)" @click="dialogVisible = false">取消</el-button>
          <el-button  @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入用水大户数据"
      templateName="大用户档案"
      :templateColumns="['客户编号', '企业名称', '联系人', '联系电话', '地址', '所属行业', '绑定水表ID', '关联DMA分区ID']"
      @success="fetchData"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
const tableData = ref([])
const loading = ref(false)
const showImport = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增档案')
const tariffOptions = ref<any[]>([])
const deviceOptions = ref<any[]>([])
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
    const res = await request.get('/api/v1/data-center/billing/accounts')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const fetchOptions = async () => {
  try {
    // 加载全部有效费率
    const tRes = await request.get('/api/v1/data-center/billing/tariffs')
    tariffOptions.value = (tRes || []).filter((t: any) => t.status === 1)
    // 加载全部水表类型的资产设备
    const aRes = await request.get('/api/v1/data-center/governance/assets')
    // device_type: 1 为水表
    deviceOptions.value = (aRes || []).filter((a: any) => a.device_type === 1 && a.status === 1)
  } catch (e) { /* fallback */ }
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
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.delete(`/api/v1/data-center/billing/accounts/${row.id}`)
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
          await request.put(`/api/v1/data-center/billing/accounts/${form.value.id}`, form.value)
        } else {
          await request.post('/api/v1/data-center/billing/accounts', form.value)
        }
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchData()
      } catch (e) { /* fallback */ }
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
  fetchOptions()
})
</script>
<style scoped>


.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin: 0;
  letter-spacing: 0.5px;
}

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

.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.table-container {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
}

.industrial-table {
  background: var(--el-fill-color-blank) ;
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-text-color: var(--el-text-color-regular);
}

.logic-text {
  font-family: "SF Mono", Consolas, monospace;
  font-size: 13px;
  background: var(--el-fill-color-lighter);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}

.text-neon { color: var(--el-color-primary); }
.text-danger { color: var(--el-color-danger); }
.industrial-tag { border: none; }
.industrial-tag-plain {
  background: var(--el-fill-color-light) ;
  border: 1px solid var(--el-border-color-light) ;
  color: var(--el-text-color-regular) ;
}
</style>
