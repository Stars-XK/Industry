<template>
  <div class="app-container wide-panel fade-in-up">
    <div class="box-card">
      <div class="panel-header">
        <span class="panel-title">边缘计算与物联网网关台账 (IoT Gateways)</span>
        <el-button type="primary"  @click="handleAdd">新增网关</el-button>
          <el-button  @click="showImport = true" icon="Upload">批量导入</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%" class="custom-table" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="gateway_sn" label="网关序列号 (SN)" width="250">
          <template #default="scope">
            <span class="highlight-text">{{ scope.row.gateway_sn }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="protocol" label="通信协议" width="150">
          <template #default="scope">
            <el-tag type="warning" effect="plain" class="custom-tag">{{ scope.row.protocol }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_online" label="在线状态" width="150">
          <template #default="scope">
            <span :class="scope.row.is_online === 1 ? 'status-dot success' : 'status-dot danger'"></span>
            {{ scope.row.is_online === 1 ? '在线 (Connected)' : '离线 (Offline)' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注说明" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" custom- @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="网关SN码" prop="gateway_sn">
          <el-input v-model="form.gateway_sn" :disabled="!!form.id" placeholder="如 GW-MAC-AABBCC" />
        </el-form-item>
        <el-form-item label="通信协议" prop="protocol">
          <el-select v-model="form.protocol" style="width: 100%" class="dark-input">
            <el-option label="MQTT" value="MQTT" />
            <el-option label="Modbus TCP" value="Modbus TCP" />
            <el-option label="OPC UA" value="OPC UA" />
          </el-select>
        </el-form-item>
        <el-form-item label="在线状态" prop="is_online">
          <el-radio-group v-model="form.is_online">
            <el-radio :value="1">在线</el-radio>
            <el-radio :value="0">离线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button type="primary" @click="submitForm" >确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入边缘网关数据"
      templateName="边缘网关"
      :templateColumns="['网关序列号 (SN)', '通信协议', '在线状态', '备注说明']"
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
const dialogTitle = ref('新增网关')
const formRef = ref()
const form = ref({
  id: '',
  gateway_sn: '',
  protocol: 'MQTT',
  is_online: 0,
  remark: ''
})
const rules = {
  gateway_sn: [{ required: true, message: '必填', trigger: 'blur' }]
}
const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/data-center/governance/gateways')
    tableData.value = res || []
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}
const handleAdd = () => {
  dialogTitle.value = '新增网关'
  dialogVisible.value = true
}
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑网关'
  form.value = { ...row }
  dialogVisible.value = true
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm('删除网关属于高危操作。如果该网关已被测点映射规则绑定，系统将拦截。是否继续？', '警告', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/api/v1/data-center/governance/gateways/${row.id}`)
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
          await request.put(`/api/v1/data-center/governance/gateways/${form.value.id}`, form.value)
        } else {
          await request.post('/api/v1/data-center/governance/gateways', form.value)
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
  fetchData()
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
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.highlight-text {
  color: var(--el-color-primary);
  font-family: 'SF Mono', Consolas, monospace;
}
.custom-tag {
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  color: var(--el-color-warning);
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
