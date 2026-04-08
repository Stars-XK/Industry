<template>
  <div class="premium-container fade-in-up">
    <div class="glass-panel hover-lift">
      <div class="panel-header">
        <span class="panel-title">测点与时序标签映射管理 (IoT Tag Mapping)</span>
        <el-button type="primary" class="neon-btn" @click="handleAdd">新增映射</el-button>
          <el-button class="glass-btn" @click="showImport = true" icon="Upload">批量导入</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" class="dark-table" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="device_name" label="关联物理设备">
          <template #default="scope">
            <span class="highlight-text">[{{ scope.row.device_code }}] {{ scope.row.device_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gateway_sn" label="归属网关SN">
          <template #default="scope">
            <el-tag type="info" v-if="scope.row.gateway_sn" class="custom-tag">{{ scope.row.gateway_sn }}</el-tag>
            <span v-else class="text-gray-400">未绑定网关</span>
          </template>
        </el-table-column>
        <el-table-column prop="plc_address" label="PLC/寄存器地址" width="150" />
        <el-table-column prop="ts_tag_name" label="时序库全局标签" width="200">
          <template #default="scope">
            <el-tag type="warning" effect="plain" class="custom-tag-warning">{{ scope.row.ts_tag_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadband" label="死区过滤阈值" width="150" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" custom-class="glass-dialog" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="绑定物理设备" prop="device_id">
          <el-select v-model="form.device_id" filterable placeholder="选择台账设备" style="width: 100%" class="dark-input">
            <el-option v-for="item in deviceOptions" :key="item.id" :label="`[${item.device_code}] ${item.device_name}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属边缘网关" prop="gateway_id">
          <el-select v-model="form.gateway_id" filterable clearable placeholder="可选：选择归属网关" style="width: 100%" class="dark-input">
            <el-option v-for="item in gatewayOptions" :key="item.id" :label="item.gateway_sn" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="PLC寄存器地址" prop="plc_address">
          <el-input v-model="form.plc_address" placeholder="如 40001, DB1.DBW2" />
        </el-form-item>
        <el-form-item label="时序库全局标签" prop="ts_tag_name">
          <el-input v-model="form.ts_tag_name" placeholder="如 PUMP_01_PRESS" />
        </el-form-item>
        <el-form-item label="死区过滤阈值" prop="deadband">
          <el-input-number v-model="form.deadband" :min="0" :step="0.1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button type="primary" @click="submitForm" class="neon-btn">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入测点映射数据"
      templateName="测点映射"
      :templateColumns="['关联物理设备', '归属网关SN', 'PLC/寄存器地址', '时序库全局标签', '死区过滤阈值']"
      @success="fetchOptions"
    />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const tableData = ref<any[]>([])
const loading = ref(false)
const showImport = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增映射')
const formRef = ref()
const form = ref({
  id: '',
  device_id: null,
  gateway_id: null,
  plc_address: '',
  ts_tag_name: '',
  deadband: 0
})

const deviceOptions = ref<any[]>([])
const gatewayOptions = ref<any[]>([])

const rules = {
  device_id: [{ required: true, message: '必须绑定物理设备', trigger: 'change' }],
  ts_tag_name: [{ required: true, message: '必填，必须全局唯一', trigger: 'blur' }]
}

const fetchOptions = async () => {
  try {
    deviceOptions.value = await request.get('/api/data-center/governance/assets') || []
    gatewayOptions.value = await request.get('/api/data-center/governance/gateways') || []
  } catch (e) { /* fallback */ }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/governance/tags')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增映射'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑映射'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除时序标签 [${row.ts_tag_name}] 的映射关系吗？SCADA系统将无法再解析该测点。`, '高危操作确认', {
    type: 'error'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/governance/tags/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/data-center/governance/tags/${form.value.id}`, form.value)
        } else {
          await request.post('/api/data-center/governance/tags', form.value)
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
}

onMounted(() => {
  fetchOptions()
  fetchData()
})
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}
.highlight-text {
  color: #00d8ff;
  font-weight: 600;
}
.custom-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}
.custom-tag-warning {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #eab308;
}
</style>
