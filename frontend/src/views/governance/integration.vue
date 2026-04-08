<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">异构设备与数据源接入网关</div>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="14">
          <div class="panel-section">
            <div class="section-title">边缘网关协议通道</div>
            <div class="table-wrapper">
              <el-table :data="channels" style="width: 100%">
                <el-table-column prop="name" label="通道名称" min-width="150" />
                <el-table-column prop="protocol" label="接入协议" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '在线' ? 'success' : 'danger'" effect="light" disable-transitions>
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="qps" label="QPS" width="100" align="right">
                  <template #default="{ row }">
                    <span class="qps-value">{{ row.qps }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
        <el-col :span="10">
          <div class="panel-section">
            <div class="section-title">MQTT 代理中间件状态</div>
            <div class="metrics-grid">
              <div class="metric-cell">
                <div class="metric-label">Broker IP</div>
                <div class="metric-val">192.168.1.100</div>
              </div>
              <div class="metric-cell">
                <div class="metric-label">端口</div>
                <div class="metric-val">1883 / 8883</div>
              </div>
              <div class="metric-cell highlight">
                <div class="metric-label">当前连接数</div>
                <div class="metric-val text-blue">1,425</div>
              </div>
              <div class="metric-cell highlight">
                <div class="metric-label">每秒吞吐 (Msg/s)</div>
                <div class="metric-val text-green">4,200</div>
              </div>
              <div class="metric-cell">
                <div class="metric-label">鉴权插件</div>
                <div class="metric-val">Webhook Token</div>
              </div>
              <div class="metric-cell">
                <div class="metric-label">离线缓存队列</div>
                <div class="metric-val">12 MB</div>
              </div>
            </div>
          </div>
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
<style scoped>
.page-container {
  padding: 24px;
  background: #f4f6f8;
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.panel-section {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
  height: 100%;
}

.section-title {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
}

.table-wrapper {
  padding: 0;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

.qps-value {
  font-family: "SF Mono", Consolas, monospace;
  font-weight: 500;
  color: #606266;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #f0f2f5;
}

.metric-cell {
  background: #fff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.metric-cell.highlight {
  background: linear-gradient(180deg, #fff 0%, #fafbfc 100%);
}

.metric-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.metric-val {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.metric-cell.highlight .metric-val {
  font-size: 28px;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}

.text-blue { color: #409EFF; }
.text-green { color: #67C23A; }
</style>
