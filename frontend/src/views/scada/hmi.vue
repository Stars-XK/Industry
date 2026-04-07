<template>
  <div class="page-container hmi-container">
    <el-card class="box-card" shadow="never" style="height: 100%;">
      <template #header>
        <div class="card-header">
          <span>工业 SCADA 工艺组态监控 (2号泵站模拟)</span>
          <div>
            <el-tag type="success" effect="dark" style="margin-right: 10px;">
              <el-icon class="is-loading"><Loading /></el-icon> MQTT 数据实时连接中
            </el-tag>
          </div>
        </div>
      </template>
      
      <div class="hmi-canvas">
        <!-- 模拟组态背景图 -->
        <div class="tank-container">
          <div class="tank">
            <div class="water-level" :style="{ height: tankLevel + '%' }"></div>
            <span class="label">清水池液位: {{ tankLevel.toFixed(1) }} %</span>
          </div>
        </div>

        <div class="pipe-horizontal">
          <div class="flow-animation"></div>
        </div>

        <!-- 泵组件 -->
        <div class="pump-station">
          <div class="pump" :class="{ running: pumpStatus === 1 }">
            <el-icon :size="40" :class="{ 'is-spinning': pumpStatus === 1 }"><Setting /></el-icon>
            <div class="pump-label">2# 变频主泵</div>
          </div>
          
          <div class="data-panel">
            <div class="data-row">状态: <el-tag :type="pumpStatus === 1 ? 'success' : 'danger'" size="small">{{ pumpStatus === 1 ? '运行中' : '已停机' }}</el-tag></div>
            <div class="data-row">频率: <span class="val">{{ pumpFreq }}</span> Hz</div>
            <div class="data-row">功率: <span class="val">{{ pumpPower }}</span> kW</div>
          </div>

          <div class="control-panel">
            <el-button 
              :type="pumpStatus === 1 ? 'danger' : 'success'" 
              @click="handleControl(pumpStatus === 1 ? 0 : 1)"
              :icon="SwitchButton"
            >
              {{ pumpStatus === 1 ? '远程停机' : '远程开机' }}
            </el-button>
            <el-button type="primary" @click="handleSetFreq" :icon="Operation">调节频率</el-button>
          </div>
        </div>
        
        <div class="pipe-horizontal">
          <div class="flow-animation"></div>
        </div>
        
        <div class="valve">
          <el-icon :size="30" color="#E6A23C"><Filter /></el-icon>
          <div style="font-size: 12px; margin-top: 5px;">出水总阀</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Setting, SwitchButton, Operation, Loading, Filter } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 模拟绑定变量
const tankLevel = ref(65.5)
const pumpStatus = ref(1)
const pumpFreq = ref(48.2)
const pumpPower = ref(31.5)
let timer: any = null

// 模拟前端定时接收 MQTT 数据更新 (真实环境应使用 WebSocket 订阅后端推流)
const simulateRealtimeData = () => {
  timer = setInterval(() => {
    if (pumpStatus.value === 1) {
      pumpFreq.value = parseFloat((45 + Math.random() * 5).toFixed(1))
      pumpPower.value = parseFloat((30 + Math.random() * 2).toFixed(1))
      tankLevel.value = Math.max(10, Math.min(90, tankLevel.value + (Math.random() > 0.5 ? 0.5 : -0.5)))
    } else {
      pumpFreq.value = 0
      pumpPower.value = 0
    }
  }, 2000)
}

const handleControl = (targetStatus: number) => {
  const actionText = targetStatus === 1 ? '开机' : '停机'
  ElMessageBox.confirm(`危险操作预警：确定要对 [2# 变频主泵] 执行远程${actionText}操作吗？此操作将被记录入审计日志！`, '安全反控确认', {
    confirmButtonText: '强制执行',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await request.post('/api/scada/hmi/control', {
        deviceId: 2,
        tag: 'Pump.Status',
        value: targetStatus
      })
      ElMessage.success(`指令下发成功！`)
      pumpStatus.value = targetStatus // 模拟状态改变
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleSetFreq = () => {
  ElMessageBox.prompt('请输入目标运行频率 (Hz)，范围 25.0 ~ 50.0', '频率调节', {
    confirmButtonText: '下发指令',
    cancelButtonText: '取消',
    inputPattern: /^(2[5-9]|[3-4][0-9]|50)(\.[0-9])?$/,
    inputErrorMessage: '频率格式不正确',
  }).then(async ({ value }) => {
    try {
      await request.post('/api/scada/hmi/control', {
        deviceId: 2,
        tag: 'Pump.Freq',
        value: parseFloat(value)
      })
      ElMessage.success(`变频指令 [${value} Hz] 下发成功！`)
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

onMounted(() => {
  simulateRealtimeData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: calc(100vh - 100px);
  box-sizing: border-box;
  background-color: #0b1a2a; /* 工业暗黑风格背景 */
}

.box-card {
  background-color: #112233;
  border-color: #1a3344;
  color: #fff;
}
:deep(.el-card__header) {
  border-bottom: 1px solid #1a3344;
}

.hmi-canvas {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 模拟水池 */
.tank-container {
  width: 150px;
  height: 200px;
  border: 4px solid #5a6b7c;
  border-top: none;
  border-radius: 0 0 10px 10px;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
}
.water-level {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(180deg, #409EFF, #0a529e);
  transition: height 1s ease;
  border-radius: 0 0 6px 6px;
}
.tank .label {
  position: absolute;
  top: -30px;
  width: 100%;
  text-align: center;
  color: #409EFF;
  font-weight: bold;
}

/* 管道与流向动画 */
.pipe-horizontal {
  width: 100px;
  height: 20px;
  background: #5a6b7c;
  position: relative;
  overflow: hidden;
}
.flow-animation {
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    rgba(64, 158, 255, 0.5) 0,
    rgba(64, 158, 255, 0.5) 10px,
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
  background: rgba(0, 0, 0, 0.3);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #1a3344;
}
.pump {
  color: #909399;
  text-align: center;
  margin-bottom: 20px;
}
.pump.running {
  color: #67C23A;
}
.is-spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
.pump-label {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}
.data-panel {
  background: #1e1e1e;
  padding: 15px;
  border-radius: 6px;
  width: 200px;
  margin-bottom: 20px;
  font-family: Consolas, monospace;
}
.data-row {
  margin-bottom: 10px;
  font-size: 14px;
}
.val {
  color: #E6A23C;
  font-weight: bold;
  font-size: 18px;
}
.control-panel {
  display: flex;
  gap: 10px;
}

.valve {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
