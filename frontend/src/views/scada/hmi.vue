<template>
  <div class="app-container fade-in-up hmi-container">
    <div class="box-card" style="height: 100%;">
      <div class="panel-header">
        <div>
          <div class="header-title">工业 SCADA 工艺组态监控 (丰泽2号泵站)</div>
          <div class="header-subtitle">Industrial SCADA HMI</div>
        </div>
        <div>
          <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark" class="industrial-tag">
            <el-icon :class="{ 'is-loading': isConnected }"><Loading v-if="isConnected" /><CircleClose v-else /></el-icon> 
            {{ isConnected ? 'MQTT 实时推流中' : 'WebSocket 连接断开' }}
          </el-tag>
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
              :class="pumpStatus === 1 ? '-danger' : ''" 
              @click="handleControl(pumpStatus === 1 ? 0 : 1)"
              :icon="SwitchButton"
              :disabled="!isConnected"
            >
              {{ pumpStatus === 1 ? '远程停机' : '远程开机' }}
            </el-button>
            <el-button  @click="handleSetFreq" :icon="Operation" :disabled="!isConnected || pumpStatus === 0">调节频率</el-button>
          </div>
        </div>
        
        <div class="pipe-horizontal">
          <div class="flow-animation" :style="{ animationPlayState: pumpStatus === 1 ? 'running' : 'paused' }"></div>
        </div>
        
        <div class="valve">
          <el-icon :size="30" color="#E6A23C"><Filter /></el-icon>
          <div style="font-size: 12px; margin-top: 5px;">出水总阀</div>
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
      ElMessage.success(`指令下发成功！等待设备响应...`)
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
      ElMessage.success(`变频指令 [${value} Hz] 下发成功！等待设备响应...`)
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
  min-height: calc(100vh - 84px);
}

.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
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
  transition: all 0.2s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 16px;
}
.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}
.header-subtitle {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.hmi-canvas {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}
/* 模拟水池 */
.tank-container {
  width: 150px;
  height: 200px;
  border: 4px solid var(--el-color-primary-light-3);
  border-top: none;
  border-radius: 0 0 10px 10px;
  position: relative;
  background: var(--el-fill-color-dark);
  box-shadow: inset 0 -10px 30px var(--el-color-primary-light-8);
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
  text-shadow: 0 0 10px rgba(0, 216, 255, 0.5);
}
/* 管道与流向动画 */
.pipe-horizontal {
  width: 100px;
  height: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(0, 216, 255, 0.2);
  border-bottom: 1px solid rgba(0, 216, 255, 0.2);
  position: relative;
  overflow: hidden;
}
.flow-animation {
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 216, 255, 0.3) 0,
    rgba(0, 216, 255, 0.3) 10px,
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
  background: rgba(0, 0, 0, 0.4);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(0, 216, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}
.pump {
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}
.pump.running {
  color: #00ffaa;
  text-shadow: 0 0 15px rgba(0, 255, 170, 0.5);
}
.is-spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
.pump-label {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}
.data-panel {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px 20px;
  border-radius: 8px;
  width: 220px;
  margin-bottom: 20px;
  font-family: "SF Mono", Consolas, monospace;
}
.data-row {
  margin-bottom: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.data-row:last-child {
  margin-bottom: 0;
}
.val {
  color: var(--el-color-primary);
  font-weight: 600;
  font-size: 18px;
  text-shadow: 0 0 10px rgba(0, 216, 255, 0.3);
}
.control-panel {
  display: flex;
  gap: 12px;
}
.valve {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}
.valve .el-icon {
  filter: drop-shadow(0 0 8px rgba(230, 162, 60, 0.4));
}
.-danger {
  background: transparent;
  border: 1px solid rgba(245, 108, 108, 0.5);
  color: #F56C6C;
  transition: all 0.3s ease;
  font-family: "SF Pro Display", sans-serif;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}
.-danger:hover:not(:disabled) {
  background: rgba(245, 108, 108, 0.1);
  box-shadow: 0 0 15px rgba(245, 108, 108, 0.3);
  border-color: #F56C6C;
}
.industrial-tag {
  border: none;
}
</style>
