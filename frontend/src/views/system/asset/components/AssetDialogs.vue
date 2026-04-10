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
        
        <el-divider content-position="left">空间属性</el-divider>
        <el-form-item label="中心经度" prop="center_lng">
          <el-input v-model="zoneForm.center_lng" placeholder="请输入经度 (如: 118.6)" type="number" />
        </el-form-item>
        <el-form-item label="中心纬度" prop="center_lat">
          <el-input v-model="zoneForm.center_lat" placeholder="请输入纬度 (如: 24.9)" type="number" />
        </el-form-item>
        <el-form-item label="坐标系" prop="crs">
          <el-select v-model="zoneForm.crs" placeholder="请选择坐标系">
            <el-option label="CGCS2000" value="CGCS2000" />
            <el-option label="WGS84" value="WGS84" />
            <el-option label="GCJ02" value="GCJ02" />
          </el-select>
        </el-form-item>
        <el-form-item label="分区边界" prop="boundary_gis">
          <el-input 
            type="textarea" 
            v-model="zoneForm.boundary_gis" 
            placeholder="请在资产地图中通过圈选工具绘制边界，暂不支持手动输入GeoJSON" 
            :rows="3" 
            disabled 
          />
        </el-form-item>
        <el-form-item label="扩展属性" prop="properties">
          <el-input type="textarea" v-model="zoneForm.properties" placeholder="输入 JSON 格式的扩展属性" :rows="3" />
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
        
        <el-divider content-position="left">空间与扩展属性</el-divider>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="siteForm.address" placeholder="输入物理地址" />
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input v-model="siteForm.lng" placeholder="经度" type="number" />
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input v-model="siteForm.lat" placeholder="纬度" type="number" />
        </el-form-item>
        <el-form-item label="坐标系" prop="crs">
          <el-select v-model="siteForm.crs" placeholder="请选择坐标系">
            <el-option label="CGCS2000" value="CGCS2000" />
            <el-option label="WGS84" value="WGS84" />
            <el-option label="GCJ02" value="GCJ02" />
          </el-select>
        </el-form-item>
        <el-form-item label="扩展属性" prop="properties">
          <el-input type="textarea" v-model="siteForm.properties" placeholder="输入 JSON，如供水规模、标高等" :rows="3" />
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

        <el-divider content-position="left">空间与扩展属性</el-divider>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="deviceForm.manufacturer" placeholder="输入厂家名称" />
        </el-form-item>
        <el-form-item label="规格型号" prop="model">
          <el-input v-model="deviceForm.model" placeholder="输入型号" />
        </el-form-item>
        <el-form-item label="经度" prop="lng">
          <el-input v-model="deviceForm.lng" placeholder="经度" type="number" />
        </el-form-item>
        <el-form-item label="纬度" prop="lat">
          <el-input v-model="deviceForm.lat" placeholder="纬度" type="number" />
        </el-form-item>
        <el-form-item label="扩展属性" prop="properties">
          <el-input type="textarea" v-model="deviceForm.properties" placeholder="输入 JSON，如口径、材质、量程等" :rows="3" />
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
        <el-form-item label="物理单位" prop="unit">
          <el-input v-model="pointForm.unit" placeholder="如 m³/h, MPa" />
        </el-form-item>

        <el-divider content-position="left">测点业务属性</el-divider>
        <el-form-item label="量程下限" prop="range_min">
          <el-input v-model="pointForm.range_min" placeholder="输入量程下限" type="number" />
        </el-form-item>
        <el-form-item label="量程上限" prop="range_max">
          <el-input v-model="pointForm.range_max" placeholder="输入量程上限" type="number" />
        </el-form-item>
        <el-form-item label="扩展属性" prop="properties">
          <el-input type="textarea" v-model="pointForm.properties" placeholder="输入 JSON，如报警阈值、采集频率等" :rows="3" />
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
const zoneForm = reactive({ id: null, parent_id: 0, zone_name: '', level: 1, mnf_baseline: 0, center_lng: null, center_lat: null, crs: 'CGCS2000', properties: '', boundary_gis: '' })
const zoneRules = { zone_name: [{ required: true, message: '请输入分区名称', trigger: 'blur' }] }

// Site
const siteDialogVisible = ref(false)
const siteFormRef = ref<any>(null)
const siteForm = reactive({ id: null, zone_id: null as number | null, site_code: '', site_name: '', site_type: 1, address: '', lng: null, lat: null, crs: 'CGCS2000', properties: '' })
const siteRules = {
  site_code: [{ required: true, message: '请输入站点编码', trigger: 'blur' }],
  site_name: [{ required: true, message: '请输入站点名称', trigger: 'blur' }]
}

// Device
const deviceDialogVisible = ref(false)
const deviceFormRef = ref<any>(null)
const deviceForm = reactive({ id: null, site_id: null as number | null, device_code: '', device_name: '', device_type: 1, status: 1, manufacturer: '', model: '', lng: null, lat: null, properties: '' })
const deviceRules = {
  device_code: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  device_name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
}

// Point
const pointDialogVisible = ref(false)
const pointFormRef = ref<any>(null)
const pointForm = reactive({ id: null, device_id: null as number | null, point_code: '', point_name: '', point_category: 1, data_type: 'float', unit: '', range_min: null, range_max: null, properties: '' })
const pointRules = {
  point_code: [{ required: true, message: '请输入测点编码', trigger: 'blur' }],
  point_name: [{ required: true, message: '请输入测点名称', trigger: 'blur' }]
}

// Methods to open dialogs
const openZoneDialog = (parentIdOrRow?: any, data?: any) => {
  let row = data;
  let pid = 0;
  if (typeof parentIdOrRow === 'number') { pid = parentIdOrRow; row = data; }
  else { row = parentIdOrRow; }
  
  Object.assign(zoneForm, { id: null, parent_id: pid, zone_name: '', level: 1, mnf_baseline: 0, center_lng: null, center_lat: null, crs: 'CGCS2000', properties: '', boundary_gis: '' })
  if (row) {
    Object.assign(zoneForm, row)
    if (typeof row.properties === 'object' && row.properties !== null) zoneForm.properties = JSON.stringify(row.properties, null, 2)
    if (typeof row.boundary_gis === 'object' && row.boundary_gis !== null) zoneForm.boundary_gis = JSON.stringify(row.boundary_gis)
  }
  zoneDialogVisible.value = true
}

const openSiteDialog = (zoneIdOrRow?: any, data?: any) => {
  let row = data;
  let zid = null;
  if (typeof zoneIdOrRow === 'number') { zid = zoneIdOrRow; row = data; }
  else { row = zoneIdOrRow; }

  Object.assign(siteForm, { id: null, zone_id: zid, site_code: '', site_name: '', site_type: 1, address: '', lng: null, lat: null, crs: 'CGCS2000', properties: '' })
  if (row) {
    Object.assign(siteForm, row)
    if (typeof row.properties === 'object' && row.properties !== null) siteForm.properties = JSON.stringify(row.properties, null, 2)
  }
  siteDialogVisible.value = true
}

const openDeviceDialog = (siteIdOrRow?: any, data?: any) => {
  let row = data;
  let sid = null;
  if (typeof siteIdOrRow === 'number') { sid = siteIdOrRow; row = data; }
  else { row = siteIdOrRow; }

  Object.assign(deviceForm, { id: null, site_id: sid, device_code: '', device_name: '', device_type: 1, status: 1, manufacturer: '', model: '', lng: null, lat: null, properties: '' })
  if (row) {
    Object.assign(deviceForm, row)
    if (typeof row.properties === 'object' && row.properties !== null) deviceForm.properties = JSON.stringify(row.properties, null, 2)
  }
  deviceDialogVisible.value = true
}

const openPointDialog = (deviceIdOrRow?: any, data?: any) => {
  let row = data;
  let did = null;
  if (typeof deviceIdOrRow === 'number') { did = deviceIdOrRow; row = data; }
  else { row = deviceIdOrRow; }

  Object.assign(pointForm, { id: null, device_id: did, point_code: '', point_name: '', point_category: 1, data_type: 'float', unit: '', range_min: null, range_max: null, properties: '' })
  if (row) {
    Object.assign(pointForm, row)
    if (typeof row.properties === 'object' && row.properties !== null) pointForm.properties = JSON.stringify(row.properties, null, 2)
  }
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
      const payload = { ...zoneForm }
      if (payload.properties) { try { payload.properties = JSON.parse(payload.properties as string) } catch (e) { } }
      emit('submit-zone', payload)
      zoneDialogVisible.value = false
    }
  })
}

const submitSite = async () => {
  if (!siteFormRef.value) return
  await siteFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const payload = { ...siteForm }
      if (payload.properties) { try { payload.properties = JSON.parse(payload.properties as string) } catch (e) { } }
      emit('submit-site', payload)
      siteDialogVisible.value = false
    }
  })
}

const submitDevice = async () => {
  if (!deviceFormRef.value) return
  await deviceFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const payload = { ...deviceForm }
      if (payload.properties) { try { payload.properties = JSON.parse(payload.properties as string) } catch (e) { } }
      emit('submit-device', payload)
      deviceDialogVisible.value = false
    }
  })
}

const submitPoint = async () => {
  if (!pointFormRef.value) return
  await pointFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const payload = { ...pointForm }
      if (payload.properties) { try { payload.properties = JSON.parse(payload.properties as string) } catch (e) { } }
      emit('submit-point', payload)
      pointDialogVisible.value = false
    }
  })
}
</script>
