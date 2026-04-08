<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>低代码可视化组态工作台</span>
      </div>
      
      <div class="designer-container">
        <!-- 左侧组件库 -->
        <div class="components-panel">
          <div class="panel-title">图元库</div>
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
            <el-button size="small" type="primary" @click="saveConfig"><el-icon><Check /></el-icon> 保存发布</el-button>
            <el-button size="small" @click="clearCanvas"><el-icon><Delete /></el-icon> 清空画布</el-button>
          </div>
          
          <div class="canvas-area" ref="canvasRef">
            <div 
              v-for="(item, index) in elements" 
              :key="index"
              class="canvas-element"
              :class="{ active: selectedIndex === index }"
              :style="{ left: item.x + 'px', top: item.y + 'px' }"
              @click="selectElement(index)"
            >
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
          <div class="panel-title">属性与数据绑定</div>
          <div class="props-content" v-if="selectedIndex !== null && elements[selectedIndex]">
            <el-form label-position="top" size="small">
              <el-form-item label="图元类型">
                <el-input :value="elements[selectedIndex].type" disabled />
              </el-form-item>
              <el-form-item label="X 坐标">
                <el-input-number v-model="elements[selectedIndex].x" :min="0" />
              </el-form-item>
              <el-form-item label="Y 坐标">
                <el-input-number v-model="elements[selectedIndex].y" :min="0" />
              </el-form-item>
              <el-form-item label="绑定测点标签 (Tag)">
                <el-select v-model="elements[selectedIndex].boundTag" placeholder="请选择绑定的物理测点" clearable>
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Operation, Switch, Box, Connection, Odometer, Check, Delete } from '@element-plus/icons-vue'

const draggedType = ref('')
const elements = ref<any[]>([])
const selectedIndex = ref<number | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

const onDragStart = (type: string) => {
  draggedType.value = type
}

const onDrop = (e: DragEvent) => {
  if (!draggedType.value) return
  
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = e.clientX - rect.left - 40 // 40 is half of element width roughly
  const y = e.clientY - rect.top - 20
  
  elements.value.push({
    type: draggedType.value,
    x,
    y,
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

const saveConfig = () => {
  if (elements.value.length === 0) {
    ElMessage.warning('画布为空，无法发布')
    return
  }
  // 模拟保存接口
  setTimeout(() => {
    ElMessage.success('组态画面发布成功，已同步至 SCADA 监控端')
  }, 500)
}
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

.designer-container {
  display: flex;
  height: 600px;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
  overflow: hidden;
  background: #fff;
}

.panel-title {
  padding: 16px 20px;
  background-color: #fafbfc;
  border-bottom: 1px solid #f0f2f5;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.components-panel {
  width: 240px;
  border-right: 1px solid #f0f2f5;
  background-color: #fff;
}

.component-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.component-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: grab;
  text-align: center;
  background-color: #fff;
  transition: all 0.2s ease;
  color: #606266;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.component-item:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: #ecf5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64,158,255,0.1);
}

.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  position: relative;
}

.toolbar {
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  gap: 12px;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-element {
  position: absolute;
  width: 120px;
  height: 64px;
  background-color: #fff;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease;
}

.canvas-element:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.canvas-element.active {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2), 0 4px 12px rgba(0,0,0,0.05);
}

.element-content {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.bound-tag {
  font-size: 11px;
  color: #67C23A;
  margin-top: 6px;
  font-weight: 500;
  font-family: "SF Mono", Consolas, monospace;
}

.empty-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 14px;
  letter-spacing: 1px;
  pointer-events: none;
}

.props-panel {
  width: 320px;
  border-left: 1px solid #f0f2f5;
  background-color: #fff;
}

.props-content {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
