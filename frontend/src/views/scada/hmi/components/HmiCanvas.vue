<template>
  <div class="hmi-canvas" v-loading="loading">
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
          @click="$emit('control', pumpStatus === 1 ? 0 : 1)"
          :icon="SwitchButton"
          :disabled="!isConnected"
        >
          {{ pumpStatus === 1 ? '远程停机' : '远程开机' }}
        </el-button>
        <el-button @click="$emit('set-freq')" :icon="Operation" :disabled="!isConnected || pumpStatus === 0">调节频率</el-button>
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
</template>

<script setup lang="ts">
import { Setting, SwitchButton, Operation, Filter } from '@element-plus/icons-vue'

defineProps<{
  loading: boolean
  isConnected: boolean
  tankLevel: number
  pumpStatus: number
  pumpFreq: number
  pumpPower: number
}>()

defineEmits(['control', 'set-freq'])
</script>

<style scoped>
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