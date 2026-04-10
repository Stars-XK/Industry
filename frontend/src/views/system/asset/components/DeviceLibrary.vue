<template>
  <div class="library-container">
    <div class="header">
      <h3>设备资产台账库</h3>
      <p>管理全局物联网设备及仪器仪表资产数据。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">录入新设备</el-button>
      <el-input placeholder="搜索设备编码或名称" style="width: 240px; margin-left: 12px" prefix-icon="Search" />
    </div>
    <el-table :data="[]" border stripe style="width: 100%; margin-top: 16px">
      <el-table-column prop="device_code" label="设备编码" width="180" />
      <el-table-column prop="device_name" label="设备名称" />
      <el-table-column prop="device_type" label="设备类型" />
      <el-table-column prop="site_name" label="挂载物理站点" />
      <el-table-column label="操作" width="150" align="center">
        <template #default>
          <el-button link type="primary">编辑</el-button>
          <el-button link type="danger">报废</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
</script>

<style scoped>
.library-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}
.header {
  margin-bottom: 24px;
}
.header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}
.header p {
  margin: 0;
  color: #687076;
  font-size: 14px;
}
.toolbar {
  display: flex;
  align-items: center;
}
</style>