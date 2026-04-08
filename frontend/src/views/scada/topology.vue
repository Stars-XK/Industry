<template>
  <div class="page-container scada-topology">
    <el-row :gutter="20" style="height: 100%;">
      <!-- 左侧 2D 拓扑画布 -->
      <el-col :span="14" style="height: 100%;">
        <el-card class="box-card" shadow="never" style="height: 100%;">
          <template #header>
            <div class="card-header">
              <span>供水 DMA 拓扑全景导航 (2D 画布)</span>
              <el-tag type="info">支持滚轮缩放、拖拽平移</el-tag>
            </div>
          </template>
          <div class="canvas-container" v-loading="loading">
            <v-chart class="chart" :option="chartOption" autoresize @click="handleChartClick" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详情/设备列表区 -->
      <el-col :span="10" style="height: 100%;">
        <el-card class="box-card" shadow="never" style="height: 100%;">
          <template #header>
            <div class="card-header">
              <span>分区设备关联信息</span>
              <el-tag v-if="currentNode" type="success">{{ currentNode.label }}</el-tag>
            </div>
          </template>
          <div v-if="!currentNode" class="empty-tip">
            <el-empty description="请从左侧 2D 画布点击选择一个 DMA 分区节点" />
          </div>
          <div v-else>
            <el-descriptions title="分区详情" :column="2" border>
              <el-descriptions-item label="分区ID">{{ currentNode.id }}</el-descriptions-item>
              <el-descriptions-item label="分区名称">{{ currentNode.label }}</el-descriptions-item>
              <el-descriptions-item label="层级">
                <el-tag size="small">{{ currentNode.level }} 级分区</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="健康状态">
                <el-tag :type="currentNode.status === 'alarm' ? 'danger' : 'success'" size="small">
                  {{ currentNode.status === 'alarm' ? '异常报警' : '正常' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <h3 style="margin-top: 20px;">挂载设备清单及实时遥测数据</h3>
            <el-table
              :data="deviceList"
              style="width: 100%; margin-top: 10px;"
              border
              v-loading="deviceLoading"
            >
              <el-table-column prop="id" label="内部ID" width="70" />
              <el-table-column prop="device_code" label="资产编号" width="140" />
              <el-table-column prop="name" label="设备名称" />
              <el-table-column prop="direction" label="流向" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.direction === '流入'" type="success">流入</el-tag>
                  <el-tag v-else-if="row.direction === '流出'" type="danger">流出</el-tag>
                  <el-tag v-else type="warning">内部</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="实时遥测" min-width="180">
                <template #default="{ row }">
                  <div v-if="row.telemetry && Object.keys(row.telemetry).length > 0">
                    <div v-for="(val, key) in row.telemetry" :key="key" style="margin-bottom: 2px;">
                      <el-tag size="small" type="primary">{{ key }}</el-tag> : <strong>{{ val }}</strong>
                    </div>
                  </div>
                  <span v-else style="color: #909399;">暂无数据</span>
                </template>
              </el-table-column>
              <template #empty>
                <div style="padding: 30px;">该分区暂无挂载设备</div>
              </template>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'
import { io, Socket } from 'socket.io-client'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreeChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, TreeChart, TooltipComponent])

const loading = ref(false)
const deviceLoading = ref(false)
const treeData = ref<any[]>([])
const deviceList = ref<any[]>([])
const currentNode = ref<any>(null)
let socket: Socket | null = null

const chartOption = ref({
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    formatter: (params: any) => {
      const data = params.data
      return `${data.name}<br/>层级: ${data.level}级分区`
    }
  },
  series: [
    {
      type: 'tree',
      data: [],
      top: '1%',
      left: '7%',
      bottom: '1%',
      right: '20%',
      symbolSize: 16,
      roam: true,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 14,
        color: '#fff'
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      emphasis: { focus: 'descendant' },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
      itemStyle: {
        color: '#409EFF',
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        color: '#5a6b7c',
        width: 2,
        curveness: 0.5
      }
    }
  ]
})

const mapTreeDataForEcharts = (nodes: any[]): any[] => {
  return nodes.map(node => {
    const isAlarm = node.status === 'alarm';
    const itemStyle = isAlarm ? {
      color: '#F56C6C',
      borderColor: '#ff9999',
      borderWidth: 3,
      shadowBlur: 10,
      shadowColor: '#F56C6C'
    } : {
      color: '#67C23A',
      borderColor: '#a0cfff',
      borderWidth: 2
    };

    return {
      name: node.label,
      value: node.id,
      id: node.id,
      level: node.level,
      status: isAlarm ? 'alarm' : 'normal',
      itemStyle: itemStyle,
      originalData: node,
      children: node.children ? mapTreeDataForEcharts(node.children) : []
    }
  })
}

const handleChartClick = (params: any) => {
  if (params.data && params.data.originalData) {
    currentNode.value = {
      ...params.data.originalData,
      status: params.data.status
    }
    getDevices(params.data.id)
  }
}

const initWebSocket = () => {
  socket = io('http://localhost:3002/scada', { transports: ['websocket'] })
  socket.on('telemetry_update', (payload: any) => {
    const { topic, data } = payload
    const parts = topic.split('/')
    if (parts.length === 4) {
      const deviceId = parseInt(parts[2], 10)
      const targetDevice = deviceList.value.find(d => d.id === deviceId)
      if (targetDevice) {
        if (!targetDevice.telemetry) targetDevice.telemetry = {}
        if (data.data) {
          for (const key in data.data) {
            targetDevice.telemetry[key] = data.data[key]
          }
        }
      }
    }
  })
}

const getTree = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/scada/topology/tree')
    treeData.value = res || []
    chartOption.value.series[0].data = mapTreeDataForEcharts(treeData.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getDevices = async (zoneId: number) => {
  deviceLoading.value = true
  try {
    const res = await request.get(`/api/scada/topology/devices/${zoneId}`)
    deviceList.value = (res || []).map((d: any) => ({ ...d, telemetry: {} }))
  } catch (error) {
    console.error(error)
  } finally {
    deviceLoading.value = false
  }
}

onMounted(() => {
  getTree()
  initWebSocket()
})

onUnmounted(() => {
  if (socket) socket.disconnect()
})
</script>

<style scoped>
.page-container {
  padding: 24px;
  height: calc(100vh - 84px);
  box-sizing: border-box;
  background-color: #050a15;
  background-image: radial-gradient(circle at 50% 50%, #0d1a38 0%, #050a15 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-card {
  display: flex;
  flex-direction: column;
  background: rgba(8, 15, 30, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 216, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  height: 100%;
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(0, 216, 255, 0.1);
  padding: 16px 24px;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}

.canvas-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.empty-tip {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-descriptions) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-descriptions__body) {
  background-color: transparent !important;
}

:deep(.el-descriptions-item__label) {
  background-color: rgba(0, 216, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.6);
  border-color: rgba(0, 216, 255, 0.1) !important;
  font-weight: 500;
}

:deep(.el-descriptions-item__content) {
  background-color: rgba(0, 0, 0, 0.2) !important;
  color: #fff;
  border-color: rgba(0, 216, 255, 0.1) !important;
}

:deep(.el-table) {
  background-color: transparent;
  color: #fff;
  border: 1px solid rgba(0, 216, 255, 0.1);
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(0, 216, 255, 0.05);
  border-bottom: 1px solid rgba(0, 216, 255, 0.1);
  color: #00d8ff;
  font-weight: 500;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(0, 0, 0, 0.2);
}

:deep(.el-table--border .el-table__inner-wrapper::after),
:deep(.el-table--border::after),
:deep(.el-table--border::before),
:deep(.el-table__inner-wrapper::before) {
  background-color: rgba(0, 216, 255, 0.1);
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(0, 216, 255, 0.05);
}
</style>
