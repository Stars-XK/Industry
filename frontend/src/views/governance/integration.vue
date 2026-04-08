<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>异构设备与数据源接入网关</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card header="边缘网关协议通道">
            <el-table :data="channels" border size="small">
              <el-table-column prop="name" label="通道名称" />
              <el-table-column prop="protocol" label="接入协议" />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === '在线' ? 'success' : 'danger'">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="qps" label="QPS" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card header="MQTT 代理中间件状态">
            <el-descriptions column="2" border>
              <el-descriptions-item label="Broker IP">192.168.1.100</el-descriptions-item>
              <el-descriptions-item label="端口">1883 / 8883(SSL)</el-descriptions-item>
              <el-descriptions-item label="当前连接数">1,425</el-descriptions-item>
              <el-descriptions-item label="每秒吞吐 (Msg/s)">4,200</el-descriptions-item>
              <el-descriptions-item label="鉴权插件">Webhook Token</el-descriptions-item>
              <el-descriptions-item label="离线缓存队列">12 MB</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const channels = ref([
  { name: '一水厂主网关', protocol: 'Modbus TCP', status: '在线', qps: 120 },
  { name: '西区泵站数据站', protocol: 'OPC UA', status: '在线', qps: 85 },
  { name: '第三方环保系统', protocol: 'HTTP API', status: '离线', qps: 0 }
])
</script>
<style scoped>.app-container { padding: 20px; }</style>
