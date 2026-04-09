<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">资产与设备台账</h1>
        <p class="page-subtitle">Asset Lifecycle Management & Digital Twin Binding</p>
      </div>
      <div class="header-actions">
        <el-button  @click="dialogVisible = true">换表/拆表录入 (防负流)</el-button>
      </div>
    </div>

    <div class="box-card" style="margin-bottom: 24px; padding: 16px 20px;">
      <el-form :inline="true" class="dark-filter-form">
        <el-form-item label="设备编码">
          <el-input placeholder="SN / 资产号" clearable  />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select placeholder="选择类型" clearable style="width: 160px"  popper-class="glass-dropdown">
            <el-option label="智能水表" value="1" />
            <el-option label="调节阀门" value="2" />
            <el-option label="离心水泵" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button >搜索台账</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="box-card" style="flex: 1; padding: 20px;">
      <el-table :data="assets" style="width: 100%" class="custom-table custom-scrollbar">
        <el-table-column prop="code" label="设备编码" width="180">
          <template #default="{ row }">
            <span class="highlight-text">[{{ row.code }}]</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="200">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-primary); font-weight: 500;">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag effect="dark" class="dark-tag">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="install_date" label="安装日期" width="140">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ row.install_date }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <div class="status-indicator" :class="row.status === '在线' ? 'status-success' : 'status-warning'">
              <span class="dot"></span>
              {{ row.status }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warranty" label="保修期至" width="140">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ row.warranty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="3D模型绑定" width="160" align="center">
          <template #default>
            <el-button size="small" class="action-btn text-cyan" link>
              <el-icon style="margin-right: 4px;"><View /></el-icon> 孪生挂载点
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="dialogVisible = true">编辑</el-button>
            <el-button link type="warning" @click="handleReplace(row)">换表接续</el-button>
            <el-button link type="success">二维码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="资产名称" prop="asset_name">
          <el-input v-model="form.asset_name" placeholder="请输入资产名称" />
        </el-form-item>
        <el-form-item label="资产类型" prop="asset_type">
          <el-select v-model="form.asset_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="智能水表" value="meter" />
            <el-option label="水泵机组" value="pump" />
            <el-option label="阀门设备" value="valve" />
            <el-option label="传感器" value="sensor" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">在用</el-radio>
            <el-radio :value="2">停用</el-radio>
            <el-radio :value="3">报废</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 换表/拆表专属弹窗 -->
    <el-dialog title="设备更换/拆除 (Meter Replacement)" v-model="replaceDialogVisible" width="650px">
      <el-alert title="强制约束：老表拆除止码必须小于或等于新表安装起码，防止时序库产生负流量突变" type="warning" show-icon style="margin-bottom: 20px" />
      <el-form :model="replaceForm" label-width="130px">
        <el-form-item label="当前设备">
          <el-input v-model="replaceForm.old_asset_name" disabled />
        </el-form-item>
        <el-form-item label="老表拆除止码">
          <el-input-number v-model="replaceForm.old_end_reading" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-divider />
        <el-form-item label="新设备编号">
          <el-input v-model="replaceForm.new_asset_code" placeholder="扫描或输入新设备条码" />
        </el-form-item>
        <el-form-item label="新表安装起码">
          <el-input-number v-model="replaceForm.new_start_reading" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="更换原因">
          <el-input type="textarea" v-model="replaceForm.reason" rows="2" placeholder="请输入更换或拆除原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replaceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReplace">确认更换</el-button>
      </template>
    </el-dialog>
  </div>

    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入资产与站点数据"
      templateName="设备站点"
      :templateColumns="['资产编码', '资产名称', '设备类型(1水表/2压力计/3水质仪/4泵站/5环境)', '型号', '供应商', '安装日期', '状态(0/1/2)']"
    />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ExcelImport from '@/components/ExcelImport/index.vue'
import { View } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const replaceDialogVisible = ref(false)
const showImport = ref(false)
const dialogTitle = ref('新增资产')
const formRef = ref()
const form = ref({
  id: undefined,
  asset_name: '',
  asset_type: '',
  location: '',
  status: 1
})
const rules = ref({
  asset_name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }]
})
const replaceForm = ref({
  old_asset_name: '',
  old_end_reading: 0,
  new_asset_code: '',
  new_start_reading: 0,
  reason: ''
})

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑资产'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleReplace = (row: any) => {
  replaceForm.value = {
    old_asset_name: row.name || row.asset_name,
    old_end_reading: 0,
    new_asset_code: '',
    new_start_reading: 0,
    reason: ''
  }
  replaceDialogVisible.value = true
}

const submitForm = () => {
  dialogVisible.value = false
}

const submitReplace = () => {
  if (replaceForm.value.old_end_reading > replaceForm.value.new_start_reading) {
    ElMessage.error('新表安装起码不能小于老表拆除止码！');
    return;
  }
  ElMessage.success('设备更换记录已保存，时序数据已防负流接续');
  replaceDialogVisible.value = false;
}

const assets = ref([
  { code: 'M-DN100-01', name: '一厂区总出水表', type: '智能水表', install_date: '2023-01-15', status: '在线', warranty: '2028-01-15' },
  { code: 'V-REG-02', name: '高位水池进水调节阀', type: '阀门', install_date: '2022-05-20', status: '在线', warranty: '2025-05-20' },
  { code: 'P-MAIN-01', name: '1号变频离心泵', type: '水泵', install_date: '2021-11-11', status: '维修中', warranty: '2024-11-11' }
])
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
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
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
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}




.highlight-text {
  color: var(--el-color-primary);
  font-family: "SF Mono", monospace;
  font-weight: 600;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-success { color: var(--el-color-success); }
.status-success .dot { background-color: var(--el-color-success); box-shadow: 0 0 8px #10b981; }
.status-warning { color: #f59e0b; }
.status-warning .dot { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }


.text-cyan { color: var(--el-color-primary); }
.danger- {
  background: transparent;
  border: 1px solid #f43f5e;
  color: var(--el-color-danger);
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s, opacity 0.3s;
}
.danger-:hover {
  background: rgba(244, 63, 94, 0.1);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  color: #fff;
}
/* Table styles */





/* Dialog Styles */

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */












.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
</style>
