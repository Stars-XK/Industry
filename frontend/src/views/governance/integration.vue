<template>
  <div class="premium-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">异构设备与数据源接入网关</h1>
        <p class="page-subtitle">Heterogeneous Device & Data Source Integration Gateway</p>
      </div>
      <div class="header-actions">
        <el-tag effect="dark" class="status-tag pulse-tag">中间件运行正常</el-tag>
      </div>
    </div>

    <el-row :gutter="24" style="flex: 1; display: flex;">
      <el-col :span="14" style="display: flex; flex-direction: column;">
        <div class="glass-panel" style="flex: 1; padding: 20px;">
          <div class="panel-header">
            <div class="panel-title">边缘网关协议通道 <span>Edge Protocol Channels</span></div>
          </div>
          <el-table :data="channels" style="width: 100%" class="dark-table custom-scrollbar">
            <el-table-column prop="name" label="通道名称" min-width="150">
              <template #default="{ row }">
                <span style="color: #e2e8f0; font-weight: 500;">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="protocol" label="接入协议" width="120">
              <template #default="{ row }">
                <span class="highlight-text">{{ row.protocol }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <div class="status-indicator" :class="row.status === '在线' ? 'status-success' : 'status-danger'">
                  <span class="dot"></span>
                  {{ row.status }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="qps" label="QPS" width="100" align="right">
              <template #default="{ row }">
                <span style="color: #00d8ff; font-weight: 600; font-family: 'SF Mono', monospace;">{{ row.qps }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="10" style="display: flex; flex-direction: column;">
        <div class="glass-panel" style="flex: 1; padding: 20px;">
          <div class="panel-header">
            <div class="panel-title">MQTT 代理中间件状态 <span>Broker Status</span></div>
          </div>
          <div class="metrics-grid">
            <div class="metric-cell">
              <div class="metric-label">Broker IP</div>
              <div class="metric-val" style="color: #94a3b8;">192.168.1.100</div>
            </div>
            <div class="metric-cell">
              <div class="metric-label">端口</div>
              <div class="metric-val" style="color: #94a3b8;">1883 / 8883</div>
            </div>
            <div class="metric-cell highlight-cell">
              <div class="metric-label text-cyan">当前连接数</div>
              <div class="metric-val text-cyan large-val">1,425</div>
            </div>
            <div class="metric-cell highlight-cell">
              <div class="metric-label text-emerald">每秒吞吐 (Msg/s)</div>
              <div class="metric-val text-emerald large-val">4,200</div>
            </div>
            <div class="metric-cell">
              <div class="metric-label">鉴权插件</div>
              <div class="metric-val" style="color: #e2e8f0;">Webhook Token</div>
            </div>
            <div class="metric-cell">
              <div class="metric-label">离线缓存队列</div>
              <div class="metric-val" style="color: #f59e0b;">12 MB</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
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
.premium-container {
  padding: 24px;
  background: radial-gradient(circle at 50% 0%, #0a192f 0%, #020617 100%);
  min-height: calc(100vh - 60px);
  color: #e2e8f0;
  font-family: "SF Pro Display", -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
}

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

.pulse-tag {
  animation: pulse 2s infinite;
  background-color: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.glass-panel {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title span {
  font-size: 12px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.highlight-text {
  color: #00d8ff;
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

.status-success { color: #10b981; }
.status-success .dot { background-color: #10b981; box-shadow: 0 0 8px #10b981; }

.status-danger { color: #f43f5e; }
.status-danger .dot { background-color: #f43f5e; box-shadow: 0 0 8px #f43f5e; animation: pulse-danger 2s infinite; }

@keyframes pulse-danger {
  0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.metric-cell {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight-cell {
  background: rgba(0, 216, 255, 0.03);
  border-color: rgba(0, 216, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(0, 216, 255, 0.02);
}

.metric-label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
  font-weight: 500;
}

.metric-val {
  font-size: 16px;
  font-weight: 600;
  font-family: "SF Mono", monospace;
}

.large-val {
  font-size: 32px;
  line-height: 1;
}

.text-cyan { color: #00d8ff; }
.text-emerald { color: #10b981; text-shadow: 0 0 10px rgba(16,185,129,0.3); }

/* Table styles */
.dark-table {
  background-color: transparent !important;
  --el-table-border-color: rgba(255, 255, 255, 0.05);
  --el-table-header-bg-color: rgba(255, 255, 255, 0.02);
  --el-table-header-text-color: #94a3b8;
  --el-table-text-color: #e2e8f0;
  --el-table-row-hover-bg-color: rgba(0, 216, 255, 0.05);
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}

:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-table-border-color); }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: var(--el-table-row-hover-bg-color) !important; }
:deep(.el-table::before) { display: none; }

.custom-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}

.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
