<template>
  <div class="app-container fade-in-up hmi-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">工业 SCADA 工艺组态监控</h1>
        <p class="page-subtitle">Industrial SCADA HMI (丰泽2号泵站)</p>
      </div>
      <div class="header-actions">
        <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark" class="industrial-tag connection-status">
          <el-icon :class="{ 'is-loading': isConnected }"><Loading v-if="isConnected" /><CircleClose v-else /></el-icon> 
          {{ isConnected ? 'MQTT 实时推流中' : 'WebSocket 连接断开' }}
        </el-tag>
      </div>
    </div>
    
    <div class="hmi-content">
      <div class="box-card">
        <div class="panel-header">
          <div>
            <div class="header-title">工艺流程监控</div>
            <div class="header-subtitle">Process Flow Monitoring</div>
          </div>
        </div>
        <div class="hmi-canvas">
          <!-- 模拟组态背景图 -->
          <div class="tank-container">
            <div class="tank">
              <div class="water-level" :style="{ height: tankLevel + '%' }"></div>
              <span class="label">清水池液位: {{ tankLevel.toFixed(1) }} %</span>
            </div>
          </div>
          <div class="pipe-horizontal">
            <div class="flow-animation" :style="{ animationPlayState: pumpStatus === 1 ? 'running' : 'paused' }"></div>
          </div>
          <!-- 泵组件 -->
          <div class="pump-station">
            <div class="pump" :class="{ running: pumpStatus === 1 }">
              <el-icon :size="40" :class="{ 'is-spinning': pumpStatus === 1 }"><Setting /></el-icon>
              <div class="pump-label">2# 变频主泵</div>
            </div>
            <div class="data-panel">
              <div class="data-row">状态: <el-tag :type="pumpStatus === 1 ? 'success' : 'danger'" size="small" class="industrial-tag">{{ pumpStatus === 1 ? '运行中' : '已停机' }}</el-tag></div>
              <div class="data-row">频率: <span class="val">{{ pumpFreq }}</span> Hz</div>
              <div class="data-row">功率: <span class="val">{{ pumpPower }}</span> kW</div>
            </div>
            <div class="control-panel">
              <el-button 
                :type="pumpStatus === 1 ? 'danger' : 'primary'" 
                @click="handleControl(pumpStatus === 1 ? 0 : 1)"
                :icon="SwitchButton"
                :disabled="!isConnected"
              >
                {{ pumpStatus === 1 ? '远程停机' : '远程开机' }}
              </el-button>
              <el-button @click="handleSetFreq" :icon="Operation" :disabled="!isConnected || pumpStatus === 0">调节频率</el-button>
            </div>
          </div>
          <div class="pipe-horizontal">
            <div class="flow-animation" :style="{ animationPlayState: pumpStatus === 1 ? 'running' : 'paused' }"></div>
          </div>
          <div class="valve">
            <el-icon :size="30" color="var(--el-color-warning)"><Filter /></el-icon>
            <div class="valve-label">出水总阀</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Setting, SwitchButton, Operation, Loading, Filter, CircleClose } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { io, Socket } from 'socket.io-client'
// 绑定变量
const tankLevel = ref(65.5)
const pumpStatus = ref(0)
const pumpFreq = ref(0.0)
const pumpPower = ref(0.0)
const isConnected = ref(false)
let socket: Socket | null = null
const initWebSocket = () => {
  socket = io('http://localhost:3002/scada', {
    transports: ['websocket']
  })
  socket.on('connect', () => {
    isConnected.value = true
  })
  socket.on('disconnect', () => {
    isConnected.value = false
  })
  socket.on('telemetry_update', (payload: any) => {
    const { topic, data } = payload
    if (topic === 'telemetry/devices/2/data' && data.data) {
      if (data.data['Pump.Status'] !== undefined) pumpStatus.value = data.data['Pump.Status']
      if (data.data['Pump.Freq'] !== undefined) pumpFreq.value = data.data['Pump.Freq']
      if (data.data['Pump.Power'] !== undefined) pumpPower.value = data.data['Pump.Power']
      // 真实液位应由传感器上传 Tank.Level，而非前端模拟涨跌
      if (data.data['Tank.Level'] !== undefined) {
        tankLevel.value = data.data['Tank.Level']
      }
    }
  })
}
const handleControl = (targetStatus: number) => {
  const actionText = targetStatus === 1 ? '开机' : '停机'
  ElMessageBox.prompt(`危险操作预警：确定要对 [丰泽2# 变频主泵] 执行远程${actionText}操作吗？此操作将被记录入审计日志！\n请输入操作密码：`, '安全反控确认', {
    confirmButtonText: '强制执行',
    cancelButtonText: '取消',
    inputType: 'password',
    type: 'warning',
    customClass: 'industrial-msg-box',
    inputValidator: (value) => {
      if (!value) return '操作密码不能为空'
      if (value !== '123456') return '操作密码错误 (默认密码: 123456)'
      return true
    }
  }).then(async () => {
    try {
      await request.post('/api/v1/scada/hmi/control', {
        deviceId: 2,
        tag: 'Pump.Status',
        value: targetStatus
      })
      ElMessage.success(`指令下发成功！等待设备响应…`)
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
const handleSetFreq = () => {
  ElMessageBox.prompt('请输入目标运行频率 (Hz)，范围 25.0 ~ 50.0', '频率调节', {
    confirmButtonText: '下发指令',
    cancelButtonText: '取消',
    inputPattern: /^(2[5-9]|[3-4][0-9]|50)(\.[0-9])?$/,
    inputErrorMessage: '频率格式不正确',
    customClass: 'industrial-msg-box'
  }).then(async ({ value }) => {
    try {
      await request.post('/api/v1/scada/hmi/control', {
        deviceId: 2,
        tag: 'Pump.Freq',
        value: parseFloat(value)
      })
      ElMessage.success(`变频指令 [${value} Hz] 下发成功！等待设备响应…`)
    } catch (e) { /* fallback */ }
  }).catch(() => {})
}
onMounted(() => {
  initWebSocket()
})
onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>
<style scoped>
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin: 0;
  letter-spacing: 0.5px;
}

.hmi-content {
  flex: 1;
  min-height: 0;
}

.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}

.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.connection-status {
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
}

.hmi-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

/* 模拟水池 */
.tank-container {
  width: 150px;
  height: 200px;
  border: 4px solid var(--el-color-primary-light-3);
  border-top: none;
  border-radius: 0 0 10px 10px;
  position: relative;
  background: var(--el-fill-color-lighter);
  box-shadow: inset 0 -10px 20px var(--el-color-primary-light-9);
}
.water-level {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(180deg, var(--el-color-primary-light-3), var(--el-color-primary));
  transition: height 1s ease;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 -5px 15px var(--el-color-primary-light-5);
}
.tank .label {
  position: absolute;
  top: -30px;
  width: 100%;
  text-align: center;
  color: var(--el-color-primary);
  font-weight: 500;
  letter-spacing: 1px;
  text-shadow: 0 0 10px var(--el-color-primary-light-5);
}
/* 管道与流向动画 */
.pipe-horizontal {
  width: 100px;
  height: 20px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-color-primary-light-8);
  border-bottom: 1px solid var(--el-color-primary-light-8);
  position: relative;
  overflow: hidden;
}
.flow-animation {
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    var(--el-color-primary-light-7) 0,
    var(--el-color-primary-light-7) 10px,
    transparent 10px,
    transparent 20px
  );
  animation: flow 2s linear infinite;
}
@keyframes flow {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
/* 泵站组件 */
.pump-station {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--el-fill-color-blank);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: inset 0 0 20px var(--el-bg-color-page);
}
.pump {
  color: var(--el-text-color-regular);
  text-align: center;
  margin-bottom: 20px;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}
.pump.running {
  color: var(--el-color-success);
  text-shadow: 0 0 15px var(--el-color-success-light-5);
}
.pump-label {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}
.is-spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
/* 数据面板 */
.data-panel {
  background: var(--el-fill-color-lighter);
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  margin-bottom: 20px;
  font-family: "SF Mono", Consolas, monospace;
  font-size: 14px;
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color-darker);
}
.data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
}
.data-row:last-child {
  margin-bottom: 0;
}
.val {
  color: var(--el-color-primary);
  font-weight: 600;
  font-size: 16px;
}
/* 控制面板 */
.control-panel {
  display: flex;
  gap: 10px;
}
.valve {
  text-align: center;
  color: var(--el-text-color-regular);
}
.valve-label {
  font-size: 12px;
  margin-top: 8px;
  font-weight: 500;
}
</style>
