
<template>
  <div class="app-container fade-in-up scada-designer">
    <div class="designer-header">
      <div class="header-left">
        <h1 class="page-title">低代码可视化组态工作台</h1>
        <el-tag size="small" type="info" class="version-tag">v2.0 Beta</el-tag>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button type="default" size="small"><el-icon><Undo /></el-icon> 撤销</el-button>
          <el-button type="default" size="small"><el-icon><Redo /></el-icon> 重做</el-button>
        </el-button-group>
        <el-button type="primary" plain size="small" style="margin-left: 12px;">
          <el-icon><VideoPlay /></el-icon> 预览运行
        </el-button>
        <el-button type="primary" size="small">
          <el-icon><Upload /></el-icon> 保存并发布
        </el-button>
      </div>
    </div>

    <div class="designer-layout">
      <!-- 左侧：图元组件库 -->
      <div class="designer-sidebar left-sidebar">
        <div class="sidebar-title">组件库 (Components)</div>
        <el-collapse v-model="activeLib" class="component-collapse">
          <el-collapse-item title="基础图元 (Basic)" name="1">
            <div class="component-grid">
              <div class="comp-item draggable-item"><div class="comp-icon rect"></div><span>矩形</span></div>
              <div class="comp-item draggable-item"><div class="comp-icon circle"></div><span>圆形</span></div>
              <div class="comp-item draggable-item"><el-icon><VideoCamera /></el-icon><span>文本</span></div>
              <div class="comp-item draggable-item"><el-icon><Link /></el-icon><span>连接线</span></div>
            </div>
          </el-collapse-item>
          <el-collapse-item title="ISA 工业符号 (ISA Symbols)" name="2">
            <div class="component-grid">
              <div class="comp-item draggable-item"><el-icon><Odometer /></el-icon><span>离心泵</span></div>
              <div class="comp-item draggable-item"><el-icon><Filter /></el-icon><span>调节阀</span></div>
              <div class="comp-item draggable-item"><el-icon><Van /></el-icon><span>储水罐</span></div>
              <div class="comp-item draggable-item"><el-icon><Stopwatch /></el-icon><span>流量计</span></div>
            </div>
          </el-collapse-item>
          <el-collapse-item title="Echarts 数据图表 (Charts)" name="3">
            <div class="component-grid">
              <div class="comp-item draggable-item"><el-icon><PieChart /></el-icon><span>仪表盘</span></div>
              <div class="comp-item draggable-item"><el-icon><DataLine /></el-icon><span>实时折线</span></div>
              <div class="comp-item draggable-item"><el-icon><Histogram /></el-icon><span>柱状图</span></div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 中间：无限拖拽画布 -->
      <div class="designer-canvas-wrapper">
        <div class="canvas-toolbar">
          <el-tooltip content="鼠标拖拽连线"><el-button circle size="small"><el-icon><Link /></el-icon></el-button></el-tooltip>
          <el-tooltip content="放大"><el-button circle size="small"><el-icon><ZoomIn /></el-icon></el-button></el-tooltip>
          <el-tooltip content="缩小"><el-button circle size="small"><el-icon><ZoomOut /></el-icon></el-button></el-tooltip>
          <el-tooltip content="自适应屏幕"><el-button circle size="small"><el-icon><FullScreen /></el-icon></el-button></el-tooltip>
        </div>
        <div class="infinite-canvas" @dragover.prevent @drop="handleDrop">
          <!-- 背景网格 -->
          <div class="grid-bg"></div>
          
          <!-- 模拟已拖入的组件 -->
          <div class="mock-node node-pump" style="top: 150px; left: 200px;" :class="{ active: selectedNode === 'pump1' }" @click="selectedNode = 'pump1'">
            <div class="node-icon"><el-icon><Odometer /></el-icon></div>
            <div class="node-label">1# 变频主泵</div>
            <div class="node-port port-right"></div>
          </div>

          <div class="mock-node node-valve" style="top: 150px; left: 450px;" :class="{ active: selectedNode === 'valve1' }" @click="selectedNode = 'valve1'">
            <div class="node-port port-left"></div>
            <div class="node-icon"><el-icon><Filter /></el-icon></div>
            <div class="node-label">出水调节阀</div>
            <div class="node-port port-right"></div>
          </div>

          <div class="mock-node node-chart" style="top: 300px; left: 200px;" :class="{ active: selectedNode === 'chart1' }" @click="selectedNode = 'chart1'">
            <div class="node-label">泵运行频率 (Hz)</div>
            <div class="mock-echarts-line"></div>
          </div>

          <!-- 模拟连接线 -->
          <svg class="connection-layer">
            <path d="M 280 180 L 450 180" class="animated-pipe" />
          </svg>
        </div>
      </div>

      <!-- 右侧：属性与数据绑定面板 -->
      <div class="designer-sidebar right-sidebar">
        <div class="sidebar-title">属性配置 (Properties)</div>
        <div v-if="!selectedNode" class="empty-selection">
          <el-empty description="请在画布中选中一个图元" :image-size="80" />
        </div>
        <div v-else class="props-panel">
          <el-tabs v-model="propTab" class="props-tabs">
            <el-tab-pane label="外观样式" name="style">
              <el-form label-position="top" size="small">
                <el-form-item label="图元名称">
                  <el-input v-model="mockProps.name" />
                </el-form-item>
                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-form-item label="X 坐标"><el-input-number v-model="mockProps.x" controls-position="right" /></el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Y 坐标"><el-input-number v-model="mockProps.y" controls-position="right" /></el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="主题颜色">
                  <el-color-picker v-model="mockProps.color" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="数据绑定 (Data)" name="data">
              <el-alert title="动态绑定资产台账中的测点数据" type="info" :closable="false" style="margin-bottom: 16px;" />
              <el-form label-position="top" size="small">
                <el-form-item label="绑定物理资产">
                  <el-select placeholder="搜索台账设备..." style="width: 100%;">
                    <el-option label="[P-MAIN-01] 1号变频离心泵" value="p1" />
                    <el-option label="[V-REG-02] 高位水池调节阀" value="v2" />
                  </el-select>
                </el-form-item>
                <el-form-item label="绑定实时遥测属性 (Tag)">
                  <el-select placeholder="选择属性..." style="width: 100%;">
                    <el-option label="RunFreq (运行频率)" value="t1" />
                    <el-option label="Power (功率)" value="t2" />
                    <el-option label="Status (启停状态)" value="t3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="动画联动规则">
                  <el-select placeholder="条件变色/旋转..." style="width: 100%;">
                    <el-option label="值 > 0 时旋转 (风扇/泵)" value="a1" />
                    <el-option label="值为 1 时亮绿灯" value="a2" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="交互事件" name="event">
              <el-button type="primary" plain size="small" style="width: 100%;">+ 添加点击事件 (如下发反控指令)</el-button>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Undo, Redo, VideoPlay, Upload, VideoCamera, Link, 
  Odometer, Filter, Van, Stopwatch, PieChart, DataLine, Histogram,
  ZoomIn, ZoomOut, FullScreen
} from '@element-plus/icons-vue';

const activeLib = ref(['1', '2', '3']);
const propTab = ref('data');
const selectedNode = ref('pump1');

const mockProps = ref({
  name: '1# 变频主泵',
  x: 200,
  y: 150,
  color: '#3b82f6'
});

const handleDrop = (e: any) => {
  ElMessage.success('图元已放置，请在右侧进行数据绑定');
};
</script>


<style scoped>
.scada-designer {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color-page);
}

.designer-header {
  height: 50px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.designer-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.designer-sidebar {
  width: 280px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.left-sidebar {
  border-right: 1px solid var(--el-border-color-light);
}

.right-sidebar {
  border-left: 1px solid var(--el-border-color-light);
}

.sidebar-title {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}

.component-collapse {
  flex: 1;
  overflow-y: auto;
  border: none;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px;
}

.comp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.comp-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.comp-item span {
  font-size: 12px;
  margin-top: 6px;
}

.comp-icon.rect { width: 20px; height: 14px; border: 2px solid currentColor; }
.comp-icon.circle { width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor; }

.designer-canvas-wrapper {
  flex: 1;
  position: relative;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

.canvas-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.infinite-canvas {
  width: 3000px;
  height: 3000px;
  position: absolute;
  top: -1000px;
  left: -1000px;
  transform: translate(1000px, 1000px);
}

.grid-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(to right, var(--el-border-color-lighter) 1px, transparent 1px),
    linear-gradient(to bottom, var(--el-border-color-lighter) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 模拟节点 */
.mock-node {
  position: absolute;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px 16px;
  box-shadow: var(--el-box-shadow-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
}

.mock-node.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.node-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.node-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 连线与端口 */
.node-port {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 2px solid var(--el-color-primary);
  border-radius: 50%;
}
.port-right { right: -5px; top: calc(50% - 4px); }
.port-left { left: -5px; top: calc(50% - 4px); }

.connection-layer {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
}

.animated-pipe {
  fill: none;
  stroke: var(--el-color-success);
  stroke-width: 3;
  stroke-dasharray: 10, 5;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  to { stroke-dashoffset: -15; }
}

.mock-echarts-line {
  width: 150px;
  height: 60px;
  background: linear-gradient(to right, transparent, var(--el-color-primary-light-9));
  border-bottom: 2px solid var(--el-color-primary);
  margin-top: 8px;
}

.empty-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.props-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.props-tabs {
  flex: 1;
}

:deep(.props-tabs .el-tabs__content) {
  padding: 16px;
}
</style>

