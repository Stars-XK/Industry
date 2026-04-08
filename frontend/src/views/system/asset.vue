<template>
  <div class="page-container">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>设备与物理资产台账管理 (Device Assets)</span>
          <el-button type="primary" @click="handleAdd">新增资产</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="资产ID" width="80" />
        <el-table-column prop="device_code" label="设备唯一编码" width="180">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.device_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="device_name" label="设备名称" width="220" />
        <el-table-column prop="device_type" label="设备类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeColor(scope.row.device_type)">
              {{ getTypeName(scope.row.device_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gis_coord" label="GIS 坐标" />
        <el-table-column prop="install_date" label="安装日期" width="150">
          <template #default="scope">
            {{ scope.row.install_date ? scope.row.install_date.split('T')[0] : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : (scope.row.status === 2 ? 'info' : 'danger')">
              {{ scope.row.status === 1 ? '在线' : (scope.row.status === 2 ? '离线' : '维修中') }}
            </el-tag>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="设备编码" prop="device_code">
          <el-input v-model="form.device_code" :disabled="!!form.id" placeholder="全网唯一，如 PUMP-001" />
        </el-form-item>
        <el-form-item label="设备名称" prop="device_name">
          <el-input v-model="form.device_name" placeholder="如 一号变频泵" />
        </el-form-item>
        <el-form-item label="设备类型" prop="device_type">
          <el-select v-model="form.device_type" style="width: 100%">
            <el-option label="水表" :value="1" />
            <el-option label="阀门" :value="2" />
            <el-option label="水泵" :value="3" />
            <el-option label="压力计" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装日期" prop="install_date">
          <el-date-picker v-model="form.install_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="GIS坐标" prop="gis_coord">
          <el-input v-model="form.gis_coord" placeholder="Lng, Lat, Alt" />
        </el-form-item>
        <el-form-item label="运行状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在线</el-radio>
            <el-radio :label="2">离线</el-radio>
            <el-radio :label="3">维修中</el-radio>
          </el-radio-group>
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
const dialogTitle = ref('新增资产')
const formRef = ref()
const form = ref({
  id: '',
  device_code: '',
  device_name: '',
  device_type: 1,
  install_date: '',
  gis_coord: '',
  status: 1
})

const rules = {
  device_code: [{ required: true, message: '必填', trigger: 'blur' }],
  device_name: [{ required: true, message: '必填', trigger: 'blur' }],
  device_type: [{ required: true, message: '必填', trigger: 'change' }]
}

const getTypeColor = (type: number) => {
  const map: any = { 1: 'primary', 2: 'warning', 3: 'success', 4: 'info' }
  return map[type] || 'info'
}

const getTypeName = (type: number) => {
  const map: any = { 1: '水表', 2: '阀门', 3: '水泵', 4: '压力计' }
  return map[type] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/data-center/governance/assets')
    tableData.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增资产'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑资产'
  form.value = { ...row, install_date: row.install_date ? row.install_date.split('T')[0] : '' }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('删除设备资产属于高危操作。如果该设备已绑定边缘采集标签或挂载在 DMA 拓扑下，系统将拒绝删除。是否继续？', '防误删确认', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/api/data-center/governance/assets/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {}
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id) {
          await request.put(`/api/data-center/governance/assets/${form.value.id}`, form.value)
        } else {
          await request.post('/api/data-center/governance/assets', form.value)
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
