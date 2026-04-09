<template>
  <div class="app-container fade-in-up scada-topology">
    <el-row :gutter="24" style="height: 100%;">
      <!-- 左侧 2D 拓扑画布 -->
      <el-col :span="14" style="height: 100%;">
        <div class="box-card" style="height: 100%;">
          <div class="panel-header">
            <div>
              <div class="header-title">供水 DMA 拓扑全景导航</div>
              <div class="header-subtitle">2D Topology Canvas (Scroll to zoom, drag to pan)</div>
            </div>
          </div>
          <div class="canvas-container" v-loading="loading">
            <v-chart class="chart" :option="chartOption" autoresize @click="handleChartClick" />
          </div>
        </div>
      </el-col>

      <!-- 右侧详情/设备列表区 -->
      <el-col :span="10" style="height: 100%;">
        <div class="box-card" style="height: 100%;">
          <div class="panel-header">
            <div>
              <div class="header-title">分区设备关联信息</div>
              <div class="header-subtitle">Zone Details & Telemetry</div>
            </div>
            <el-tag v-if="currentNode" type="success" effect="dark" class="industrial-tag">{{ currentNode.label }}</el-tag>
          </div>
          
          <div v-if="!currentNode" class="empty-tip">
            <el-empty description="请从左侧 2D 画布点击选择一个 DMA 分区节点" />
          </div>
          <div v-else class="detail-content">
            <el-descriptions title="分区详情" :column="2" border class="industrial-descriptions">
              <el-descriptions-item label="分区ID">{{ currentNode.id }}</el-descriptions-item>
              <el-descriptions-item label="分区名称">{{ currentNode.label }}</el-descriptions-item>
              <el-descriptions-item label="层级">
                <el-tag size="small" class="industrial-tag">{{ currentNode.level }} 级分区</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="健康状态">
                <el-tag :type="currentNode.status === 'alarm' ? 'danger' : 'success'" size="small" effect="dark" class="industrial-tag">
                  {{ currentNode.status === 'alarm' ? '异常报警' : '正常' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <div class="section-title" style="margin-top: 24px; margin-bottom: 12px; color: var(--el-text-color-primary); font-weight: 600;">挂载设备清单及实时遥测数据</div>
            <el-table
              :data="deviceList"
              style="width: 100%;"
              class="industrial-table"
              v-loading="deviceLoading"
            >
              <el-table-column prop="id" label="内部ID" width="70" />
              <el-table-column prop="device_code" label="资产编号" width="140" />
              <el-table-column prop="name" label="设备名称" />
              <el-table-column prop="direction" label="流向" width="80" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.direction === '流入'" type="success" effect="dark" class="industrial-tag">流入</el-tag>
                  <el-tag v-else-if="row.direction === '流出'" type="danger" effect="dark" class="industrial-tag">流出</el-tag>
                  <el-tag v-else type="warning" effect="dark" class="industrial-tag">内部</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="实时遥测" min-width="180">
                <template #default="{ row }">
                  <div v-if="row.telemetry && Object.keys(row.telemetry).length > 0" class="telemetry-box">
                    <div v-for="(val, key) in row.telemetry" :key="key" class="telemetry-item">
                      <span class="t-key">{{ key }}</span>
                      <span class="t-val">{{ val }}</span>
                    </div>
                  </div>
                  <span v-else style="color: #64748b; font-size: 12px;">暂无数据</span>
                </template>
              </el-table-column>
              <template #empty>
                <div style="padding: 30px; color: #64748b;">该分区暂无挂载设备</div>
              </template>
            </el-table>
          </div>
        </div>
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

const chartOption = ref<any>({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(0, 216, 255, 0.2)',
    textStyle: { color: '#e2e8f0' },
    formatter: (params: any) => {
      const data = params.data
      return `${data.name}<br/><span style="color: var(--el-text-color-regular);font-size:12px;">层级: ${data.level}级分区</span>`
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
        color: '#e2e8f0',
        fontFamily: 'SF Pro Display'
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
        color: '#00d8ff',
        borderColor: '#020617',
        borderWidth: 2
      },
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.3)',
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
      borderColor: '#020617',
      borderWidth: 2,
      shadowBlur: 15,
      shadowColor: 'rgba(245, 108, 108, 0.8)'
    } : {
      color: '#00d8ff',
      borderColor: '#020617',
      borderWidth: 2,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 216, 255, 0.5)'
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
    const res = await request.get('/api/v1/scada/topology/tree')
    treeData.value = res || []
    chartOption.value.series[0].data = mapTreeDataForEcharts(treeData.value)
  } catch (e) { /* fallback */ } finally {
    loading.value = false
  }
}

const getDevices = async (zoneId: number) => {
  deviceLoading.value = true
  try {
    const res = await request.get(`/api/v1/scada/topology/devices/${zoneId}`)
    deviceList.value = (res || []).map((d: any) => ({ ...d, telemetry: {} }))
  } catch (e) { /* fallback */ } finally {
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
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 16px;
}
.header-subtitle {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  font-family: "SF Mono", Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.canvas-container {
  flex: 1;
  width: 100%;
  position: relative;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}
.chart {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.empty-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-content {
  flex: 1;
  overflow: auto;
}




.industrial-table {
  background: transparent !important;
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: var(--el-fill-color-light);
  --el-table-text-color: var(--el-text-color-primary);
}


.telemetry-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.telemetry-item {
  display: flex;
  justify-content: space-between;
  font-family: "SF Mono", Consolas, monospace;
  font-size: 12px;
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
}
.telemetry-item .t-key {
  color: var(--el-text-color-regular);
}
.telemetry-item .t-val {
  color: var(--el-color-primary);
  font-weight: 600;
}
.industrial-tag {
  border: none;
}
</style>
