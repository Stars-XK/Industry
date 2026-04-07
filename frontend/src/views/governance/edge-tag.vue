<template>
  <div class="page-container">
    <!-- 边缘网关状态面板 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-card shadow="never" class="gateway-status-card">
          <template #header>
            <div class="card-header">
              <span>边缘网关状态监控与策略下发</span>
            </div>
          </template>
          <div class="gateway-list" v-loading="gatewayLoading">
            <el-row :gutter="20">
              <el-col :span="8" v-for="gw in gatewayList" :key="gw.id">
                <el-card shadow="hover" :class="{'offline-card': gw.is_online === 0}">
                  <div class="gw-header">
                    <span class="gw-title"><el-icon><Cpu /></el-icon> {{ gw.gateway_sn }}</span>
                    <el-tag :type="gw.is_online === 1 ? 'success' : 'danger'" size="small">
                      {{ gw.is_online === 1 ? '在线' : '离线' }}
                    </el-tag>
                  </div>
                  <div class="gw-metrics">
                    <div class="metric"><span class="label">协议:</span> {{ gw.protocol }}</div>
                    <div class="metric"><span class="label">CPU 负载:</span> {{ gw.cpu_load || 'N/A' }} %</div>
                    <div class="metric"><span class="label">网络延迟:</span> <span :class="{'high-latency': gw.latency > 100}">{{ gw.latency || 'N/A' }} ms</span></div>
                  </div>
                  <div class="gw-actions">
                    <el-button type="warning" size="small" plain @click="handleSendProtection(gw)" :disabled="gw.is_online === 0">下发本地断网保护策略</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 测点与标签映射管理 -->
    <el-card shadow="never" class="mapping-card">
      <div class="toolbar">
        <h2>测点与标签映射配置</h2>
        <div>
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增标签映射</el-button>
          <el-upload
            class="upload-demo"
            action="/api/data-center/edge-tag/import"
            :show-file-list="false"
            :on-success="handleImportSuccess"
            :on-error="handleImportError"
            :headers="uploadHeaders"
            accept=".xlsx,.xls"
            style="display: inline-block; margin: 0 10px;"
          >
            <el-button type="success" :icon="Upload">批量导入 (Excel)</el-button>
          </el-upload>
          <el-button @click="getList" :icon="Refresh">刷新</el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="原始标签名">
            <el-input v-model="searchForm.keyword" placeholder="如 PLC.S7.Temp" clearable />
          </el-form-item>
          <el-form-item label="设备ID">
            <el-input v-model="searchForm.device_id" placeholder="关联的设备ID" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList" :icon="Search">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        element-loading-text="Thinking..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="device_id" label="资产设备ID" width="100" />
        <el-table-column prop="tag_name" label="原始测点标签名" />
        <el-table-column prop="standard_name" label="标准化属性名" />
        <el-table-column prop="data_type" label="数据类型" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="scaling_factor" label="缩放因子" width="100" />
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_active === 1 ? 'success' : 'danger'">
              {{ row.is_active === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
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
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="说明信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Upload, Cpu } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
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
    const res = await request.get('/api/data-center/edge-tag/gateways')
    gatewayList.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    gatewayLoading.value = false
  }
}

const handleSendProtection = (gw: any) => {
  ElMessageBox.confirm(`确定要向边缘网关 [${gw.gateway_sn}] 下发断网本地保护策略吗？`, '下发策略', {
    confirmButtonText: '确定下发',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.post(`/api/data-center/edge-tag/gateways/${gw.id}/protection-policy`)
      ElMessage.success('策略已成功推送到边缘网关队列')
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/edge-tag/list', {
      params: {
        page: page.value,
        size: size.value,
        keyword: searchForm.value.keyword,
        device_id: searchForm.value.device_id
      }
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error(error)
  } finally {
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
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/data-center/edge-tag/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.id) {
        await request.put(`/api/data-center/edge-tag/update/${form.value.id}`, form.value)
        ElMessage.success('更新成功')
      } else {
        await request.post('/api/data-center/edge-tag/create', form.value)
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
.page-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}
.gateway-status-card, .mapping-card {
  border: none;
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.gw-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}
.gw-title {
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.gw-metrics {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}
.metric {
  margin-bottom: 8px;
}
.metric .label {
  color: #909399;
  display: inline-block;
  width: 80px;
}
.high-latency {
  color: #F56C6C;
  font-weight: bold;
}
.offline-card {
  opacity: 0.7;
  background-color: #fcfcfc;
}
.gw-actions {
  text-align: right;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-bar {
  margin-bottom: 10px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}
</style>
