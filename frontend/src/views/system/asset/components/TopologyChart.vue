<template>
  <div class="topology-wrapper" ref="topologyRef"></div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { TreeChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([TreeChart, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  zoneName: string
  siteList: any[]
  deviceList: any[]
}>()

const topologyRef = ref<HTMLElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)
const resizeObserver = shallowRef<ResizeObserver | null>(null)

const getSiteTypeName = (type: unknown) => {
  if (typeof type === 'string' && type.trim()) return type
  const n = Number(type)
  const map: Record<number, string> = { 1: '水厂', 2: '加压泵站', 3: '二供泵房', 4: '管网监测点' }
  return map[n] || '物理站点'
}

const scheduleResize = () => {
  requestAnimationFrame(() => {
    chartInstance.value?.resize()
  })
}

const renderTopology = () => {
  if (!topologyRef.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(topologyRef.value)
  }

  // 组装 Tree 数据
  const rootNode = {
    name: props.zoneName,
    nodeType: 'zone',
    symbol: 'circle',
    symbolSize: 18,
    itemStyle: { 
      color: '#67c23a',
      borderColor: '#e1f3d8',
      borderWidth: 4
    },
    label: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#67c23a'
    },
    children: props.siteList.map(site => {
      const realDevices = props.deviceList.filter(d => d.site_id === site.id)
      const devicesToMount = realDevices.length > 0 ? realDevices : []
      
      return {
        name: site.site_name,
        nodeType: 'site',
        rawData: site,
        symbol: 'rect',
        symbolSize: [16, 16],
        itemStyle: { 
          color: '#e6a23c',
          borderColor: '#faecd8',
          borderWidth: 3
        },
        label: {
          fontSize: 14,
          fontWeight: 600,
          color: '#b88230'
        },
        children: devicesToMount.map(dev => ({
          name: dev.deviceName,
          value: dev.deviceType,
          nodeType: 'device',
          rawData: dev,
          symbol: 'diamond',
          symbolSize: 14,
          itemStyle: { 
            color: '#409eff',
            borderColor: '#d9ecff',
            borderWidth: 2
          },
          label: {
            fontSize: 13,
            color: '#337ecc'
          },
          children: (dev.points || []).map((point: any) => ({
            name: point.pointName,
            value: point.pointType,
            nodeType: 'point',
            rawData: point,
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: {
              color: '#f56c6c',
              borderColor: '#fde2e2',
              borderWidth: 2
            },
            label: {
              fontSize: 12,
              color: '#f56c6c'
            }
          }))
        }))
      }
    })
  }

  const option = {
    tooltip: { 
      trigger: 'item', 
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eaeaea',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#11181c', fontSize: 13 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px;',
      formatter: (params: any) => {
        const data = params.data;
        if (data.nodeType === 'zone') {
          return `
            <div style="font-weight: 600; margin-bottom: 4px; color: #67c23a; font-size: 14px;">${data.name}</div>
            <div style="color: #687076; font-size: 12px;">层级：DMA 分区</div>
          `;
        }
        if (data.nodeType === 'site') {
          return `
            <div style="font-weight: 600; margin-bottom: 4px; color: #e6a23c; font-size: 14px;">${data.name}</div>
            <div style="color: #687076; font-size: 12px; margin-bottom: 4px;">编码：<span style="font-family: monospace;">${data.rawData.site_code}</span></div>
            <div style="color: #687076; font-size: 12px;">类型：${getSiteTypeName(data.rawData.site_type)}</div>
          `;
        }
        if (data.nodeType === 'device') {
          const dev = data.rawData;
          return `
            <div style="font-weight: 600; margin-bottom: 4px; color: #409eff; font-size: 14px;">${dev.deviceName}</div>
            <div style="color: #687076; font-size: 12px; margin-bottom: 4px;">编码：<span style="font-family: monospace;">${dev.deviceCode}</span></div>
            <div style="color: #687076; font-size: 12px; margin-bottom: 4px;">类型：${dev.deviceType}</div>
            <div style="color: #687076; font-size: 12px;">状态：<span style="color: ${dev.status === '在线' ? '#67c23a' : '#f56c6c'}">${dev.status}</span></div>
          `;
        }
        if (data.nodeType === 'point') {
          const point = data.rawData;
          return `
            <div style="font-weight: 600; margin-bottom: 4px; color: #f56c6c; font-size: 14px;">${point.pointName}</div>
            <div style="color: #687076; font-size: 12px; margin-bottom: 4px;">测点编码：<span style="font-family: monospace;">${point.pointCode}</span></div>
            <div style="color: #687076; font-size: 12px; margin-bottom: 4px;">数据类型：${point.pointType}</div>
            <div style="color: #687076; font-size: 12px;">物理单位：${point.unit || '-'}</div>
          `;
        }
        return data.name;
      }
    },
    series: [
      {
        type: 'tree',
        data: [rootNode],
        top: '10%',
        left: '15%',
        bottom: '10%',
        right: '25%',
        roam: true,
        symbolSize: 12,
        edgeShape: 'polyline',
        edgeForkPosition: '63%',
        initialTreeDepth: 3,
        lineStyle: {
          color: '#cbd5e1',
          width: 2,
          curveness: 0.5
        },
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 13,
          color: '#11181c'
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
        animationDuration: 650,
        animationDurationUpdate: 800,
        animationEasing: 'cubicOut'
      }
    ]
  }

  chartInstance.value.setOption(option)
  scheduleResize()
}

watch(() => [props.zoneName, props.siteList, props.deviceList], () => {
  renderTopology()
}, { deep: true })

onMounted(() => {
  renderTopology()
  window.addEventListener('resize', handleResize)
  if (topologyRef.value) {
    resizeObserver.value = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      if (rect.width > 0 && rect.height > 0) scheduleResize()
    })
    resizeObserver.value.observe(topologyRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  resizeObserver.value?.disconnect()
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 暴露方法以便父组件在 tab 切换时调用
defineExpose({ renderTopology, resize: scheduleResize })
</script>

<style scoped>
.topology-wrapper {
  width: 100%;
  height: 800px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
}
</style>
