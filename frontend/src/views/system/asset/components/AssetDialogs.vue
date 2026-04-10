<template>
  <div>
    <!-- Add/Edit Zone Dialog -->
    <el-dialog
      :title="zoneForm.id ? '编辑分区' : '添加子分区'"
      v-model="zoneDialogVisible"
      width="500px"
      custom-class="sleek-dialog"
    >
      <el-form ref="zoneFormRef" :model="zoneForm" :rules="zoneRules" label-width="100px">
        <el-form-item label="分区名称" prop="zone_name">
          <el-input v-model="zoneForm.zone_name" placeholder="请输入分区名称" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="zoneForm.level" placeholder="请选择层级">
            <el-option label="一级分区" :value="1" />
            <el-option label="二级分区" :value="2" />
            <el-option label="三级分区" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级分区" prop="parent_id">
          <el-input v-model="zoneForm.parent_id" placeholder="上级分区ID（顶级为0）" type="number" />
        </el-form-item>
        <el-form-item label="基线流量" prop="mnf_baseline">
          <el-input v-model="zoneForm.mnf_baseline" placeholder="夜间最小流量基线 (m³/h)" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="zoneDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitZone">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add/Edit Site Dialog -->
    <el-dialog
      :title="siteForm.id ? '编辑物理站点' : '添加物理站点'"
      v-model="siteDialogVisible"
      width="500px"
    >
      <el-form ref="siteFormRef" :model="siteForm" :rules="siteRules" label-width="100px">
        <el-form-item label="站点编码" prop="site_code">
          <el-input v-model="siteForm.site_code" placeholder="请输入站点编码" />
        </el-form-item>
        <el-form-item label="站点名称" prop="site_name">
          <el-input v-model="siteForm.site_name" placeholder="请输入站点名称" />
        </el-form-item>
        <el-form-item label="站点类型" prop="site_type">
          <el-select v-model="siteForm.site_type" placeholder="请选择类型">
            <el-option label="水厂" :value="1" />
            <el-option label="加压泵站" :value="2" />
            <el-option label="二供泵房" :value="3" />
            <el-option label="管网监测点" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="挂载分区" prop="zone_id">
          <el-input v-model="siteForm.zone_id" placeholder="分区ID（选填）" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="siteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSite">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add/Edit Device Dialog -->
    <el-dialog
      :title="deviceForm.id ? '编辑挂载设备' : '添加挂载设备'"
      v-model="deviceDialogVisible"
      width="500px"
    >
      <el-form ref="deviceFormRef" :model="deviceForm" :rules="deviceRules" label-width="100px">
        <el-form-item label="设备编码" prop="device_code">
          <el-input v-model="deviceForm.device_code" placeholder="请输入设备编码" />
        </el-form-item>
        <el-form-item label="设备名称" prop="device_name">
          <el-input v-model="deviceForm.device_name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="device_type">
          <el-select v-model="deviceForm.device_type" placeholder="请选择类型">
            <el-option label="智能水表" :value="1" />
            <el-option label="压力计" :value="2" />
            <el-option label="水泵" :value="3" />
            <el-option label="水质仪" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属站点" prop="site_id">
          <el-input v-model="deviceForm.site_id" placeholder="站点ID（选填）" type="number" />
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择状态">
            <el-option label="在线" :value="1" />
            <el-option label="离线" :value="2" />
            <el-option label="维修中" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDevice">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add/Edit Point Dialog -->
    <el-dialog
      :title="pointForm.id ? '编辑测点' : '添加输出测点'"
      v-model="pointDialogVisible"
      width="500px"
    >
      <el-form ref="pointFormRef" :model="pointForm" :rules="pointRules" label-width="100px">
        <el-form-item label="所属设备" prop="device_id">
          <el-input v-model="pointForm.device_id" placeholder="设备ID" type="number" />
        </el-form-item>
        <el-form-item label="测点编码" prop="point_code">
          <el-input v-model="pointForm.point_code" placeholder="如: METER_IN_01_FLOW" />
        </el-form-item>
        <el-form-item label="测点名称" prop="point_name">
          <el-input v-model="pointForm.point_name" placeholder="请输入测点名称" />
        </el-form-item>
        <el-form-item label="测点分类" prop="point_category">
          <el-select v-model="pointForm.point_category" placeholder="请选择类型">
            <el-option label="瞬时流量" :value="1" />
            <el-option label="压力" :value="2" />
            <el-option label="水质" :value="3" />
            <el-option label="状态值" :value="4" />
            <el-option label="累计流量" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据类型" prop="data_type">
          <el-input v-model="pointForm.data_type" placeholder="如: float, boolean" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="pointForm.unit" placeholder="如: m³/h, MPa" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pointDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPoint">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['submit-zone', 'submit-site', 'submit-device', 'submit-point'])

// Zone
const zoneDialogVisible = ref(false)
const zoneFormRef = ref<any>(null)
const zoneForm = reactive({ id: null, parent_id: 0, zone_name: '', level: 1 })
const zoneRules = { zone_name: [{ required: true, message: '请输入分区名称', trigger: 'blur' }] }

// Site
const siteDialogVisible = ref(false)
const siteFormRef = ref<any>(null)
const siteForm = reactive({ id: null, zone_id: null, site_code: '', site_name: '', site_type: 1 })
const siteRules = {
  site_code: [{ required: true, message: '请输入站点编码', trigger: 'blur' }],
  site_name: [{ required: true, message: '请输入站点名称', trigger: 'blur' }]
}

// Device
const deviceDialogVisible = ref(false)
const deviceFormRef = ref<any>(null)
const deviceForm = reactive({ id: null, site_id: null as number | null, device_code: '', device_name: '', device_type: 1, status: 1 })
const deviceRules = {
  device_code: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  device_name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
}

// Point
const pointDialogVisible = ref(false)
const pointFormRef = ref<any>(null)
const pointForm = reactive({ id: null, device_id: null, point_code: '', point_name: '', point_category: 1, data_type: 'float', unit: '' })
const pointRules = {
  point_code: [{ required: true, message: '请输入测点编码', trigger: 'blur' }],
  point_name: [{ required: true, message: '请输入测点名称', trigger: 'blur' }]
}

// Methods to open dialogs
const openZoneDialog = (parentId: number, data?: any) => {
  zoneForm.id = data?.id || null
  zoneForm.parent_id = parentId
  zoneForm.zone_name = data?.zone_name || ''
  zoneForm.level = data?.level || 1
  zoneDialogVisible.value = true
}

const openSiteDialog = (zoneId: number, data?: any) => {
  siteForm.id = data?.id || null
  siteForm.zone_id = zoneId
  siteForm.site_code = data?.site_code || ''
  siteForm.site_name = data?.site_name || ''
  siteForm.site_type = data?.site_type || 1
  siteDialogVisible.value = true
}

const openDeviceDialog = (siteId: number, data?: any) => {
  deviceForm.id = data?.id || null
  deviceForm.site_id = siteId
  deviceForm.device_code = data?.device_code || ''
  deviceForm.device_name = data?.device_name || ''
  deviceForm.device_type = data?.device_type || 1
  deviceDialogVisible.value = true
}

const openPointDialog = (deviceId: number, data?: any) => {
  pointForm.id = data?.id || null
  pointForm.device_id = deviceId
  pointForm.point_code = data?.point_code || ''
  pointForm.point_name = data?.point_name || ''
  pointForm.point_category = data?.point_category || 1
  pointForm.data_type = data?.data_type || 'float'
  pointForm.unit = data?.unit || ''
  pointDialogVisible.value = true
}

// Expose methods to parent
defineExpose({
  openZoneDialog,
  openSiteDialog,
  openDeviceDialog,
  openPointDialog
})

// Submits
const submitZone = async () => {
  if (!zoneFormRef.value) return
  await zoneFormRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('submit-zone', { ...zoneForm })
      zoneDialogVisible.value = false
    }
  })
}

const submitSite = async () => {
  if (!siteFormRef.value) return
  await siteFormRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('submit-site', { ...siteForm })
      siteDialogVisible.value = false
    }
  })
}

const submitDevice = async () => {
  if (!deviceFormRef.value) return
  await deviceFormRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('submit-device', { ...deviceForm })
      deviceDialogVisible.value = false
    }
  })
}

const submitPoint = async () => {
  if (!pointFormRef.value) return
  await pointFormRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('submit-point', { ...pointForm })
      pointDialogVisible.value = false
    }
  })
}
</script>
