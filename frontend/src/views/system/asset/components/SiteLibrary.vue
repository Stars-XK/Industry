<template>
  <div class="library-container">
    <div class="header">
      <h3>物理站点台账库</h3>
      <p>管理全局物理站点数据（水厂、泵房、管网等）。</p>
    </div>
    <div class="toolbar">
      <el-button type="primary" icon="Plus">注册新站点</el-button>
      <el-input placeholder="搜索站点编码或名称" style="width: 240px; margin-left: 12px" prefix-icon="Search" />
    </div>
    <el-table :data="[]" border stripe style="width: 100%; margin-top: 16px">
      <el-table-column prop="site_code" label="站点编码" width="180" />
      <el-table-column prop="site_name" label="站点名称" />
      <el-table-column prop="site_type" label="站点类型" />
      <el-table-column prop="zone_name" label="当前挂载分区" />
      <el-table-column label="操作" width="150" align="center">
        <template #default>
          <el-button link type="primary">编辑</el-button>
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