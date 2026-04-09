<template>
  <div class="app-container fade-in-up">
    <div class="box-card" v-loading="saving">
      <div class="panel-header">
        <span class="panel-title">低代码可视化组态工作台</span>
      </div>
      <div class="designer-container">
        <!-- 左侧组件库 -->
        <div class="components-panel">
          <div class="panel-subtitle">图元库</div>
          <div class="component-list">
            <div class="component-item" draggable="true" @dragstart="onDragStart('水泵')">
              <el-icon><Operation /></el-icon> 离心水泵
            </div>
            <div class="component-item" draggable="true" @dragstart="onDragStart('阀门')">
              <el-icon><Switch /></el-icon> 调节阀门
            </div>
            <div class="component-item" draggable="true" @dragstart="onDragStart('水箱')">
              <el-icon><Box /></el-icon> 储水箱
            </div>
            <div class="component-item" draggable="true" @dragstart="onDragStart('管道')">
              <el-icon><Connection /></el-icon> 连接管道
            </div>
            <div class="component-item" draggable="true" @dragstart="onDragStart('仪表')">
              <el-icon><Odometer /></el-icon> 数据仪表盘
            </div>
          </div>
        </div>
        <!-- 中间画布 -->
        <div class="canvas-panel" @dragover.prevent @drop="onDrop">
          <div class="toolbar">
            <el-button size="small" type="primary"  @click="saveConfig" :loading="saving"><el-icon><Check /></el-icon> 保存发布</el-button>
            <el-button size="small"  @click="clearCanvas"><el-icon><Delete /></el-icon> 清空画布</el-button>
          </div>
          <div class="canvas-area" ref="canvasRef">
            <div
              v-for="(item, index) in elements"
              :key="index"
              class="canvas-element"
              :class="{ active: selectedIndex === index }"
              :style="{ left: item.x + 'px', top: item.y + 'px' }"
              @click="selectElement(index)"
             tabindex="0" @keydown.enter="selectElement(index)" @keydown.space.prevent="selectElement(index)">
              <div class="element-content">
                {{ item.type }}
                <div v-if="item.boundTag" class="bound-tag">{{ item.boundTag }}</div>
              </div>
            </div>
            <div v-if="elements.length === 0" class="empty-text">拖拽左侧图元至此区域进行组态</div>
          </div>
        </div>
        <!-- 右侧属性配置 -->
        <div class="props-panel">
          <div class="panel-subtitle">属性与数据绑定</div>
          <div class="props-content" v-if="selectedIndex !== null && elements[selectedIndex]">
            <el-form label-position="top" size="small">
              <el-form-item label="图元类型">
                <el-input :value="elements[selectedIndex].type" disabled class="dark-input" />
              </el-form-item>
              <el-form-item label="X 坐标">
                <el-input-number v-model="elements[selectedIndex].x" :min="0" class="dark-input" />
              </el-form-item>
              <el-form-item label="Y 坐标">
                <el-input-number v-model="elements[selectedIndex].y" :min="0" class="dark-input" />
              </el-form-item>
              <el-form-item label="绑定测点标签 (Tag)">
                <el-select v-model="elements[selectedIndex].boundTag" placeholder="请选择绑定的物理测点" clearable class="dark-input" style="width: 100%">
                  <el-option label="PUMP_01_STATUS (1号泵状态)" value="PUMP_01_STATUS" />
                  <el-option label="PUMP_01_FREQ (1号泵频率)" value="PUMP_01_FREQ" />
                  <el-option label="VALVE_02_OPEN (2号阀门开度)" value="VALVE_02_OPEN" />
                  <el-option label="TANK_01_LEVEL (1号水池液位)" value="TANK_01_LEVEL" />
                </el-select>
              </el-form-item>
              <el-form-item label="动画配置">
                <el-switch v-model="elements[selectedIndex].animation" active-text="开启运转动画" />
              </el-form-item>
            </el-form>
          </div>
          <div v-else class="empty-text" style="padding: 20px;">请在画布中选中一个图元</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Operation, Switch, Box, Connection, Odometer, Check, Delete } from '@element-plus/icons-vue'
import { saveHMIConfig } from '@/api/system'
const draggedType = ref('')
const elements = ref<any[]>([])
const selectedIndex = ref<number | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const onDragStart = (type: string) => {
  draggedType.value = type
}
const onDrop = (e: DragEvent) => {
  if (!draggedType.value || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left - 60 // 居中偏移
  const y = e.clientY - rect.top - 32
  elements.value.push({
    type: draggedType.value,
    x: Math.max(0, x),
    y: Math.max(0, y),
    boundTag: '',
    animation: false
  })
  selectedIndex.value = elements.value.length - 1
  draggedType.value = ''
}
const selectElement = (index: number) => {
  selectedIndex.value = index
}
const clearCanvas = () => {
  elements.value = []
  selectedIndex.value = null
}
const saveConfig = async () => {
  if (elements.value.length === 0) {
    ElMessage.warning('画布为空，无法发布')
    return
  }
  saving.value = true
  try {
    const res: any = await saveHMIConfig({ config: elements.value })
    if (res.code === 200) {
      ElMessage.success('组态画面保存并发布成功')
    }
  } catch (err) {
    ElMessage.error('发布失败')
  } finally {
    saving.value = false
  }
}
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
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
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
}
/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.designer-container {
  display: flex;
  height: 600px;
  border-top: 1px solid var(--el-border-color-light);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}
.panel-subtitle {
  padding: 16px 20px;
  background-color: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--el-border-color-light);
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
.components-panel {
  width: 240px;
  border-right: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-light);
}
.component-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.component-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  cursor: grab;
  text-align: center;
  background-color: var(--el-fill-color-light);
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
  color: var(--el-text-color-regular);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.component-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: rgba(0, 216, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--el-color-primary-light-8);
}
.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.4);
  position: relative;
}
.toolbar {
  padding: 12px 20px;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  gap: 12px;
}
.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-image: radial-gradient(var(--el-border-color-darker) 1px, transparent 1px);
  background-size: 20px 20px;
}
.canvas-element {
  position: absolute;
  width: 120px;
  height: 64px;
  background-color: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.canvas-element:hover {
  box-shadow: 0 6px 16px rgba(0,216,255,0.2);
  border-color: var(--el-color-primary-light-5);
}
.canvas-element.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px rgba(0,216,255,0.5), 0 4px 12px rgba(0,0,0,0.3);
}
.element-content {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.bound-tag {
  font-size: 11px;
  color: var(--el-color-primary);
  margin-top: 6px;
  font-weight: 500;
  font-family: "SF Mono", Consolas, monospace;
}
.empty-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #64748b;
  font-size: 14px;
  letter-spacing: 1px;
  pointer-events: none;
}
.props-panel {
  width: 320px;
  border-left: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-light);
}
.props-content {
  padding: 20px;
}
</style>
