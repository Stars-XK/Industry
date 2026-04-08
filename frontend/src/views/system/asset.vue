<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">资产与设备台账</h1>
        <p class="page-subtitle">Asset Lifecycle Management & Digital Twin Binding</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="dialogVisible = true">换表/拆表录入 (防负流)</el-button>
      </div>
    </div>

    <div class="glass-panel hover-lift" style="margin-bottom: 24px; padding: 16px 20px;">
      <el-form :inline="true" class="dark-filter-form">
        <el-form-item label="设备编码">
          <el-input placeholder="SN / 资产号" clearable class="glass-input" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select placeholder="选择类型" clearable style="width: 160px" class="glass-select" popper-class="glass-dropdown">
            <el-option label="智能水表" value="1" />
            <el-option label="调节阀门" value="2" />
            <el-option label="离心水泵" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="glass-btn">搜索台账</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="glass-panel hover-lift" style="flex: 1; padding: 20px;">
      <el-table :data="assets" style="width: 100%" class="dark-table custom-scrollbar">
        <el-table-column prop="code" label="设备编码" width="180">
          <template #default="{ row }">
            <span class="highlight-text">[{{ row.code }}]</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="200">
          <template #default="{ row }">
            <span style="color: #e2e8f0; font-weight: 500;">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag effect="dark" class="dark-tag">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="install_date" label="安装日期" width="140">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ row.install_date }}</span>
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
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ row.warranty }}</span>
          </template>
        </el-table-column>
        <el-table-column label="3D模型绑定" width="160" align="center">
          <template #default>
            <el-button size="small" class="action-btn text-cyan" link>
              <el-icon style="margin-right: 4px;"><View /></el-icon> 孪生挂载点
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="换表接续防负流录入单" v-model="dialogVisible" width="560px" class="glass-dialog" :show-close="false">
      <div style="background: rgba(244, 63, 94, 0.1); border-left: 4px solid #f43f5e; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
        <div style="color: #f43f5e; font-weight: 600; font-size: 14px; margin-bottom: 4px;">防产销差突变保护</div>
        <div style="color: #fda4af; font-size: 13px;">系统将自动接续新老表底码，防止产销差计算出现巨大负值</div>
      </div>
      
      <el-form label-width="120px" label-position="left" class="dark-form">
        <el-form-item label="旧表编号">
          <el-input value="M-0021 (故障拆除)" disabled class="glass-input is-disabled" />
        </el-form-item>
        <el-form-item label="旧表拆除止码">
          <el-input-number :min="0" :precision="2" style="width: 100%" controls-position="right" class="glass-input-number" />
        </el-form-item>
        
        <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 24px 0;"></div>
        
        <el-form-item label="新表编号">
          <el-input placeholder="扫码或手动录入新表 SN" class="glass-input" />
        </el-form-item>
        <el-form-item label="新表安装起码">
          <el-input-number :min="0" :precision="2" style="width: 100%" controls-position="right" class="glass-input-number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="danger-neon-btn" @click="dialogVisible = false">确认换表接续</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { View } from '@element-plus/icons-vue'
const dialogVisible = ref(false)
const assets = ref([
  { code: 'M-DN100-01', name: '一厂区总出水表', type: '智能水表', install_date: '2023-01-15', status: '在线', warranty: '2028-01-15' },
  { code: 'V-REG-02', name: '高位水池进水调节阀', type: '阀门', install_date: '2022-05-20', status: '在线', warranty: '2025-05-20' },
  { code: 'P-MAIN-01', name: '1号变频离心泵', type: '水泵', install_date: '2021-11-11', status: '维修中', warranty: '2024-11-11' }
])
</script>
<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}
.highlight-text {
  color: #00d8ff;
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.dark-tag {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
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
.status-success { color: #10b981; }
.status-success .dot { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
.status-warning { color: #f59e0b; }
.status-warning .dot { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
  transform: translateY(-1px);
}
.text-cyan { color: #00d8ff; }
.danger-neon-btn {
  background: transparent;
  border: 1px solid #f43f5e;
  color: #f43f5e;
  transition: all 0.3s;
}
.danger-neon-btn:hover {
  background: rgba(244, 63, 94, 0.1);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  color: #fff;
}
/* Table styles */
:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}
:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-table-border-color); }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: var(--el-table-row-hover-bg-color) !important; }
:deep(.el-table::before) { display: none; }
/* Dialog Styles */
:deep(.glass-dialog) {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
:deep(.dark-filter-form .el-form-item) {
  margin-bottom: 0;
}
:deep(.dark-form .el-form-item__label),
:deep(.dark-filter-form .el-form-item__label) {
  color: #94a3b8;
  font-weight: 500;
}
:deep(.glass-input .el-input__wrapper),
:deep(.glass-input-number .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #e2e8f0;
}
:deep(.glass-input.is-disabled .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}
:deep(.glass-input .el-input__wrapper:hover:not(.is-disabled)),
:deep(.glass-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}
:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}
:deep(.glass-select .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-select .el-input__inner),
:deep(.glass-input .el-input__inner),
:deep(.glass-input-number .el-input__inner) {
  color: #e2e8f0;
}
:deep(.glass-input.is-disabled .el-input__inner) {
  color: #94a3b8;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
}
:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #00d8ff !important;
}
</style>
