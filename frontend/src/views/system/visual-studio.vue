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
.app-container { padding: 20px; }
.designer-container {
  display: flex;
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.panel-title {
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-weight: bold;
  font-size: 14px;
}

.components-panel {
  width: 200px;
  border-right: 1px solid #dcdfe6;
  background-color: #fff;
}

.component-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: grab;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.3s;
}
.component-item:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: #ecf5ff;
}

.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  position: relative;
}

.toolbar {
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(90deg, rgba(200, 200, 200, 0.15) 10%, transparent 0),
                    linear-gradient(rgba(200, 200, 200, 0.15) 10%, transparent 0);
  background-size: 20px 20px;
}

.canvas-element {
  position: absolute;
  width: 100px;
  height: 60px;
  background-color: #fff;
  border: 2px solid #909399;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.canvas-element.active {
  border-color: #409EFF;
  box-shadow: 0 0 8px rgba(64,158,255,0.5);
}

.element-content {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.bound-tag {
  font-size: 10px;
  color: #67C23A;
  margin-top: 5px;
  font-weight: normal;
}

.empty-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 16px;
  pointer-events: none;
}

.props-panel {
  width: 300px;
  border-left: 1px solid #dcdfe6;
  background-color: #fff;
}

.props-content {
  padding: 15px;
}
</style>
