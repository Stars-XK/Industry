<template>
  <div class="app-container fade-in-up">
    <!-- 边缘网关状态面板 -->
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :span="24">
        <div class="box-card">
          <div class="panel-header">
            <div class="header-title">边缘网关状态监控与策略下发</div>
            <div class="header-subtitle">Edge Gateway Monitoring & Policy Deployment</div>
          </div>
          <div class="gateway-list" v-loading="gatewayLoading">
            <el-row :gutter="20">
              <el-col :span="8" v-for="gw in gatewayList" :key="gw.id">
                <div class="industrial-card" :class="{'offline-card': gw.is_online === 0}">
                  <div class="gw-header">
                    <span class="gw-title"><el-icon><Cpu /></el-icon> {{ gw.gateway_sn }}</span>
                    <el-tag :type="gw.is_online === 1 ? 'success' : 'danger'" size="small" effect="dark" class="industrial-tag">
                      {{ gw.is_online === 1 ? '在线' : '离线' }}
                    </el-tag>
                  </div>
                  <div class="gw-metrics">
                    <div class="metric"><span class="label">协议:</span> <span class="value">{{ gw.protocol }}</span></div>
                    <div class="metric"><span class="label">CPU 负载:</span> <span class="value">{{ gw.cpu_load || 'N/A' }} %</span></div>
                    <div class="metric"><span class="label">网络延迟:</span> <span class="value" :class="{'high-latency': gw.latency > 100}">{{ gw.latency || 'N/A' }} ms</span></div>
                  </div>
                  <div class="gw-actions">
                    <el-button class=" -warning" size="small" @click="handleSendProtection(gw)" :disabled="gw.is_online === 0">下发本地保护策略</el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 测点与标签映射管理 -->
    <div class="box-card" style="flex: 1;">
      <div class="toolbar">
        <div>
          <div class="header-title">测点与标签映射配置</div>
          <div class="header-subtitle">Point / Tag Mapping Configuration</div>
        </div>
        <div class="toolbar-actions">
          <el-button  @click="handleAdd" :icon="Plus">新增映射</el-button>
          <el-button  @click="showImport = true" icon="Upload">批量导入</el-button>
          <el-button  @click="getList" :icon="Refresh">刷新</el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="industrial-form">
          <el-form-item label="原始标签名">
            <el-input v-model="searchForm.keyword" placeholder="如 PLC.S7.Temp" clearable />
          </el-form-item>
          <el-form-item label="设备ID">
            <el-input v-model="searchForm.device_id" placeholder="关联的设备ID" clearable />
          </el-form-item>
          <el-form-item>
            <el-button  @click="getList" :icon="Search">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-container">
        <el-table
          :data="tableData"
          style="width: 100%"
          class="industrial-table"
          v-loading="loading"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="device_id" label="设备ID" width="100" />
          <el-table-column prop="tag_name" label="原始测点标签名" />
          <el-table-column prop="standard_name" label="标准化属性名" />
          <el-table-column prop="data_type" label="数据类型" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="scaling_factor" label="缩放因子" width="100" />
          <el-table-column prop="is_active" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.is_active" :active-value="1" :inactive-value="0" class="industrial-switch" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button link class="text-neon" @click="handleEdit(row)">编辑</el-button>
              <el-button link class="text-danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="getList"
          class="industrial-pagination"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" custom-class="industrial-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="industrial-form">
        <el-form-item label="设备ID" prop="device_id">
          <el-input-number v-model="form.device_id" :min="1" placeholder="输入关联设备ID" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="网关ID" prop="gateway_id">
          <el-select v-model="form.gateway_id" placeholder="选择所属边缘网关 (可选)" style="width: 100%;" clearable>
            <el-option v-for="gw in gatewayList" :key="gw.id" :label="gw.gateway_sn" :value="gw.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="原始标签名" prop="tag_name">
          <el-input v-model="form.tag_name" placeholder="例如：PLC.S7.Temperature" />
        </el-form-item>
        <el-form-item label="寄存器地址" prop="plc_address">
          <el-input v-model="form.plc_address" placeholder="例如：40001 (可选)" />
        </el-form-item>
        <el-form-item label="标准属性名" prop="standard_name">
          <el-input v-model="form.standard_name" placeholder="例如：temperature" />
        </el-form-item>
        <el-form-item label="死区过滤阈值" prop="deadband">
          <el-input-number v-model="form.deadband" :min="0" :step="0.01" placeholder="默认 0" style="width: 100%;" />
          <div class="form-tip">变化量小于此值的数据将被边缘网关丢弃，减少上云流量。</div>
        </el-form-item>
        <el-form-item label="数据类型" prop="data_type">
          <el-select v-model="form.data_type" placeholder="请选择数据类型" style="width: 100%;">
            <el-option label="FLOAT" value="float" />
            <el-option label="INT" value="int" />
            <el-option label="BOOLEAN" value="boolean" />
            <el-option label="STRING" value="string" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="例如：°C, MPa, m³/h" />
        </el-form-item>
        <el-form-item label="缩放因子" prop="scaling_factor">
          <el-input-number v-model="form.scaling_factor" :step="0.1" placeholder="默认 1.0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-radio-group v-model="form.is_active">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="说明信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button  style="border-color: #64748b; color: #cbd5e1" @click="dialogVisible = false">取消</el-button>
        <el-button  @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>

    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入边缘标签映射数据"
      templateName="边缘标签映射"
      :templateColumns="['设备ID', '原始测点标签名', '标准化属性名', '数据类型', '单位', '缩放因子', '状态', '备注']"
      @success="getList"
    />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Upload, Cpu } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const showImport = ref(false)
const gatewayLoading = ref(false)
const tableData = ref([])
const gatewayList = ref<any[]>([])
const page = ref(1)
const size = ref(15)
const total = ref(0)

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

const searchForm = ref({
  keyword: '',
  device_id: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增标签映射')
const formRef = ref()
const form = ref({
  id: undefined,
  device_id: undefined,
  gateway_id: undefined,
  tag_name: '',
  plc_address: '',
  standard_name: '',
  deadband: 0,
  data_type: 'float',
  unit: '',
  scaling_factor: 1.0,
  is_active: 1,
  remark: ''
})

const rules = {
  device_id: [{ required: true, message: '请输入资产设备ID', trigger: 'blur' }],
  tag_name: [{ required: true, message: '请输入原始测点标签名', trigger: 'blur' }],
  standard_name: [{ required: true, message: '请输入标准化属性名', trigger: 'blur' }],
  data_type: [{ required: true, message: '请选择数据类型', trigger: 'change' }]
}

const getGatewayList = async () => {
  gatewayLoading.value = true
  try {
    const res = await request.get('/api/v1/data-center/edge-tag/gateways')
    gatewayList.value = res || []
  } catch (e) { /* fallback */ } finally {
    gatewayLoading.value = false
  }
}

const handleSendProtection = (gw: any) => {
  ElMessageBox.confirm(`确定要向边缘网关 [${gw.gateway_sn}] 下发断网本地保护策略吗？`, '下发策略', {
    confirmButtonText: '确定下发',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    try {
      await request.post(`/api/v1/data-center/edge-tag/gateways/${gw.id}/protection-policy`)
      ElMessage.success('策略已成功推送到边缘网关队列')
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/v1/data-center/edge-tag/list', {
      params: {
        page: page.value,
        size: size.value,
        keyword: searchForm.value.keyword,
        device_id: searchForm.value.device_id
      }
    })
    tableData.value = Array.isArray(res) ? res : (res.list || []) || []
    total.value = res.total || 0
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}

const handleImportSuccess = (res: any) => {
  if (res.code === 200 || res.success) {
    ElMessage.success('Excel 批量导入成功')
    getList()
  } else {
    ElMessage.error(res.message || '导入失败')
  }
}

const handleImportError = () => {
  ElMessage.error('网络或服务器异常，批量导入失败')
}

const resetForm = () => {
  form.value = {
    id: undefined,
    device_id: undefined,
    gateway_id: undefined,
    tag_name: '',
    plc_address: '',
    standard_name: '',
    deadband: 0,
    data_type: 'float',
    unit: '',
    scaling_factor: 1.0,
    is_active: 1,
    remark: ''
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增标签映射'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  resetForm()
  form.value = { ...row }
  dialogTitle.value = '编辑标签映射'
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除测点 [${row.tag_name}] 的映射记录吗？`, '提示', {
    type: 'warning',
    customClass: 'industrial-msg-box'
  }).then(async () => {
    await request.delete(`/api/v1/data-center/edge-tag/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/v1/data-center/edge-tag/update/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/v1/data-center/edge-tag/create', form.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      getList()
    }
  })
}

onMounted(() => {
  getGatewayList()
  getList()
})
</script>

<style scoped>

.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
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
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.panel-header {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 16px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.5px;
}
.header-subtitle {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.industrial-card {
  background: rgba(2, 6, 23, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.industrial-card:hover {
  border-color: rgba(0, 216, 255, 0.3);
  box-shadow: inset 0 0 20px rgba(0, 216, 255, 0.05);
}
.offline-card {
  opacity: 0.6;
  border-color: rgba(245, 108, 108, 0.2);
}
.gw-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 10px;
}
.gw-title {
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}
.gw-metrics {
  margin-bottom: 15px;
  font-size: 13px;
  font-family: "SF Mono", Consolas, monospace;
  flex: 1;
}
.metric {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}
.metric .label {
  color: var(--el-text-color-regular);
}
.metric .value {
  color: var(--el-color-primary);
}
.high-latency {
  color: #F56C6C !important;
  text-shadow: 0 0 10px rgba(245, 108, 108, 0.5);
}
.gw-actions {
  text-align: right;
  margin-top: auto;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 16px;
}
.toolbar-actions {
  display: flex;
  gap: 12px;
}
.search-bar {
  margin-bottom: 16px;
}
.table-container {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.3);
  flex: 1;
}
.industrial-table {
  background: transparent !important;
  --el-table-border-color: rgba(148, 163, 184, 0.05);
  --el-table-header-bg-color: rgba(15, 23, 42, 0.6);
  --el-table-header-text-color: #cbd5e1;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(30, 41, 59, 0.5);
  --el-table-text-color: var(--el-text-color-regular);
}


.-warning {
  border-color: rgba(230, 162, 60, 0.5);
  color: #E6A23C;
}
.-warning:hover:not(:disabled) {
  background: rgba(230, 162, 60, 0.1);
  box-shadow: 0 0 15px rgba(230, 162, 60, 0.3);
  border-color: #E6A23C;
}
.-success {
  border-color: rgba(103, 194, 58, 0.5);
  color: #67C23A;
}
.-success:hover:not(:disabled) {
  background: rgba(103, 194, 58, 0.1);
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
  border-color: #67C23A;
}
.text-neon {
  color: var(--el-color-primary);
}
.text-danger {
  color: #F56C6C;
}
.industrial-form 





.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}


.form-tip {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 5px;
  line-height: 1.4;
}
</style>
