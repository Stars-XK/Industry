<template>
  <div class="library-container">
    <div class="header">
      <h3>测点数据字典库</h3>
      <p>统一管理系统中的时序数据点位映射规则。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">新增测点定义</el-button>
      <el-input placeholder="搜索测点编码" style="width: 240px; margin-left: 12px" prefix-icon="Search" />
    </div>
    <el-table :data="[]" border stripe style="width: 100%; margin-top: 16px">
      <el-table-column prop="point_code" label="测点编码" width="180" />
      <el-table-column prop="point_name" label="测点名称" />
      <el-table-column prop="data_type" label="数据类型" width="120" />
      <el-table-column prop="unit" label="物理单位" width="100" />
      <el-table-column prop="device_name" label="关联设备" />
      <el-table-column label="操作" width="150" align="center">
        <template #default>
          <el-button link type="primary">修改映射</el-button>
          <el-button link type="danger">删除</el-button>
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