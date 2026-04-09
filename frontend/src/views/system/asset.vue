<template>
  <div class="asset-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">全域物理资产与设备台账 (Asset Ledger)</h1>
        <p class="page-subtitle">从 部门 ➔ 分区 ➔ 站点 ➔ 设备 ➔ 测点 的全生命周期映射与 2D 关联图谱</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="custom-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="2D 资产桑基图 (Sankey 视图)" name="sankey">
        <el-card shadow="hover" class="sankey-card">
          <template #header>
            <div class="card-header">
              <span>全域资产层级拓扑与数据流向 (Org ➔ Zone ➔ Site ➔ Device ➔ Point ➔ TDengine ➔ NRW)</span>
              <el-button type="primary" size="small" @click="initSankey">重新渲染 2D 桑基图</el-button>
            </div>
          </template>
          <div ref="sankeyRef" style="width: 100%; height: 700px;"></div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="结构化层级管理列表" name="list">
        <el-row :gutter="20">
          <!-- 左侧：部门、分区与站点树 -->
          <el-col :span="6">
            <el-card shadow="hover" class="tree-card">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span>空间与站点拓扑树</span>
                  <el-button link type="primary" icon="Plus">新增</el-button>
                </div>
              </template>
              <el-input v-model="filterText" placeholder="搜索部门 / 分区 / 站点" style="margin-bottom: 15px" />
              <el-tree
                ref="treeRef"
                :data="siteTree"
                :props="defaultProps"
                :filter-node-method="filterNode"
                default-expand-all
                highlight-current
                @node-click="handleNodeClick"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <el-icon v-if="data.level === 'org'" style="color: var(--el-color-primary)"><OfficeBuilding /></el-icon>
                    <el-icon v-else-if="data.level === 'zone'" style="color: var(--el-color-success)"><MapLocation /></el-icon>
                    <el-icon v-else-if="data.level === 'site'" style="color: var(--el-color-warning)"><HomeFilled /></el-icon>
                    <span style="margin-left: 8px">{{ node.label }}</span>
                  </span>
                </template>
              </el-tree>
            </el-card>
          </el-col>

          <!-- 右侧：设备与测点列表 -->
          <el-col :span="18">
            <el-card shadow="hover" class="table-card">
              <template #header>
                <div class="header-actions">
                  <span class="table-title">
                    {{ currentSiteName ? `[${currentSiteName}] 下挂载的设备与测点` : '请在左侧选择站点 (如水厂/二供泵房)' }}
                  </span>
                  <div>
                    <el-button type="primary" :disabled="!currentSiteName" icon="Plus">新增设备</el-button>
                  </div>
                </div>
              </template>

              <!-- 仅在选中站点时显示 -->
              <template v-if="currentSiteName">
                <el-alert
                  title="业务提示"
                  type="info"
                  description="请在此处维护设备台账。展开设备行即可配置该设备输出的数据类型（测点），以便与 TDEngine 实时数据清洗引擎对接。"
                  show-icon
                  style="margin-bottom: 16px;"
                />

                <el-table :data="deviceList" style="width: 100%" row-key="id" border stripe>
                  <!-- 展开行：展示测点 -->
                  <el-table-column type="expand">
                    <template #default="props">
                      <div class="point-list-wrapper">
                        <div class="point-header">
                          <h4><el-icon><Connection /></el-icon> 设备输出测点 (Measuring Points)</h4>
                          <el-button class="add-point-btn" size="small" type="primary" plain icon="Plus">补充测点类型</el-button>
                        </div>
                        <el-table :data="props.row.points" size="small" border>
                          <el-table-column prop="pointCode" label="测点编码" width="160" />
                          <el-table-column prop="pointName" label="测点名称" />
                          <el-table-column prop="pointType" label="数据类型" width="120">
                            <template #default="scope">
                              <el-tag size="small" :type="getPointTagType(scope.row.pointType)">
                                {{ scope.row.pointType }}
                              </el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="unit" label="单位" width="80" />
                          <el-table-column prop="updateTime" label="更新时间" width="160" />
                          <el-table-column label="操作" width="120" fixed="right">
                            <template #default>
                              <el-button link type="primary" size="small">配置规则</el-button>
                              <el-button link type="danger" size="small">移除</el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </template>
                  </el-table-column>

                  <!-- 设备主信息 -->
                  <el-table-column prop="deviceCode" label="设备编码" width="150" />
                  <el-table-column prop="deviceName" label="设备名称" min-width="150" />
                  <el-table-column prop="deviceType" label="设备类型" width="120">
                    <template #default="scope">
                      <el-tag effect="light">{{ scope.row.deviceType }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="installDate" label="安装日期" width="120" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <span :class="['status-dot', scope.row.status === '在线' ? 'online' : (scope.row.status === '维修中' ? 'warning' : 'offline')]"></span>
                      {{ scope.row.status }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="160" fixed="right">
                    <template #default>
                      <el-button link type="primary" size="small">编辑</el-button>
                      <el-button link type="primary" size="small">换表/接续</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
              
              <!-- 未选择时的空状态 -->
              <el-empty v-else description="请先在左侧树形结构中选择具体的 站点 节点" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { OfficeBuilding, MapLocation, HomeFilled, Connection, Plus } from '@element-plus/icons-vue'

// --- Tab 逻辑 ---
const activeTab = ref('sankey')
const sankeyRef = ref<HTMLElement | null>(null)
let sankeyChart: echarts.ECharts | null = null

const handleTabClick = (tab: any) => {
  if (tab.paneName === 'sankey') {
    nextTick(() => {
      initSankey()
    })
  }
}

// --- 左侧树逻辑 ---
const filterText = ref('')
const treeRef = ref<any>(null)
const currentSiteName = ref('')

const defaultProps = {
  children: 'children',
  label: 'label',
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleNodeClick = (data: any) => {
  if (data.level === 'site') {
    currentSiteName.value = data.label
    // 实际项目中应在此根据 data.id 调用后端接口获取 deviceList
  } else {
    currentSiteName.value = ''
  }
}

// 模拟数据：部门 -> 分区 -> 站点 (与 mysql_seed.sql 保持完全一致)
const siteTree = ref([
  {
    id: 1,
    label: '泉州水务集团',
    level: 'org',
    children: [
      {
        id: 2,
        label: '丰泽区供水分公司',
        level: 'org',
        children: [
          {
            id: 102,
            label: '丰泽区 (DMA分区)',
            level: 'zone',
            children: [
              {
                id: 201,
                label: '东海科技园区DMA',
                level: 'zone',
                children: [
                  { id: 1, label: '东海园区进水泵站 (加压泵站)', level: 'site' }
                ]
              },
              {
                id: 202,
                label: '泉港新片区DMA',
                level: 'zone',
                children: [
                  { id: 3, label: '西湖水质监测点 (管网监测点)', level: 'site' }
                ]
              },
              { id: 2, label: '丰泽2号加压泵站', level: 'site' }
            ]
          }
        ]
      },
      {
        id: 4,
        label: '鲤城区供水分公司',
        level: 'org',
        children: [
          {
            id: 104,
            label: '鲤城区 (DMA分区)',
            level: 'zone',
            children: [
              {
                id: 204,
                label: '洛江开发区DMA',
                level: 'zone',
                children: [
                  { id: 4, label: '鲤城地下泵房 (二供泵房)', level: 'site' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
])

// 模拟数据：设备与测点列表 (匹配 mysql_seed.sql 真实数据)
const deviceList = ref([
  {
    id: '1',
    deviceCode: 'METER_IN_01',
    deviceName: '东海园区总进水管表',
    deviceType: '智能水表',
    installDate: '2023-01-15',
    status: '在线',
    points: [
      { pointCode: 'PLC.S7.Temp', pointName: '温度', pointType: '温度', unit: '°C', updateTime: '2026-04-09 10:00:00' },
      { pointCode: 'PLC.S7.Pressure', pointName: '水压', pointType: '压力', unit: 'MPa', updateTime: '2026-04-09 10:00:00' },
      { pointCode: 'PLC.S7.FlowRate', pointName: '瞬时流量', pointType: '瞬时流量', unit: 'm³/h', updateTime: '2026-04-09 10:00:00' }
    ]
  },
  {
    id: '203',
    deviceCode: 'PRESS_01',
    deviceName: '东海末端管网压力计',
    deviceType: '压力计',
    installDate: '2022-05-20',
    status: '在线',
    points: []
  }
])

const getPointTagType = (type: string) => {
  switch (type) {
    case '瞬时流量': return 'warning'
    case '累计流量': return 'success'
    case '压力': return 'danger'
    default: return 'info'
  }
}

// --- 2D 桑基图逻辑 ---
const initSankey = () => {
  if (!sankeyRef.value) return
  if (sankeyChart) sankeyChart.dispose()

  sankeyChart = echarts.init(sankeyRef.value)
  
  // 严格遵循用户描述的完整链路数据节点
  const data = [
    // 1. 基础物理层
    { name: '用户与部门', itemStyle: { color: '#5470c6' } },
    { name: '分区(DMA)', itemStyle: { color: '#91cc75' } },
    { name: '营收用户水卡', itemStyle: { color: '#fac858' } },
    { name: '站点(水厂/泵站/监测点)', itemStyle: { color: '#ee6666' } },
    { name: '设备(水表/水泵/阀门)', itemStyle: { color: '#73c0de' } },
    
    // 2. 测点输出层
    { name: '瞬时流量测点', itemStyle: { color: '#3ba272' } },
    { name: '累计流量测点', itemStyle: { color: '#fc8452' } },
    { name: '状态测点(压力/pH/浊度)', itemStyle: { color: '#9a60b4' } },
    
    // 3. 时序数据清洗与聚合层
    { name: '实时数据源定时抓取', itemStyle: { color: '#ea7ccc' } },
    { name: 'TDengine (tgen) 时序底座清洗', itemStyle: { color: '#5470c6' } },
    
    // 4. 指标计算层 (供水端)
    { name: '设备最新状态展示', itemStyle: { color: '#91cc75' } },
    { name: '设备5分钟/1小时数据', itemStyle: { color: '#fac858' } },
    { name: '2-4点分区夜间最小流量', itemStyle: { color: '#ee6666' } },
    { name: '切割出设备日用量', itemStyle: { color: '#73c0de' } },
    { name: '汇总出分区日/月供水量', itemStyle: { color: '#3ba272' } },

    // 5. 指标计算层 (营收端)
    { name: '营收数据源接入', itemStyle: { color: '#fc8452' } },
    { name: '单个用户日/月用水量', itemStyle: { color: '#9a60b4' } },
    { name: '汇总出分区日/月售水量', itemStyle: { color: '#ea7ccc' } },

    // 6. 最终展现层
    { name: '全域各分区产销差量', itemStyle: { color: '#d35400' } }
  ]

  const links = [
    // 基础关系链路
    { source: '用户与部门', target: '分区(DMA)', value: 20 },
    { source: '分区(DMA)', target: '营收用户水卡', value: 6 },
    { source: '分区(DMA)', target: '站点(水厂/泵站/监测点)', value: 14 },
    { source: '站点(水厂/泵站/监测点)', target: '设备(水表/水泵/阀门)', value: 14 },
    
    // 设备产生测点
    { source: '设备(水表/水泵/阀门)', target: '瞬时流量测点', value: 5 },
    { source: '设备(水表/水泵/阀门)', target: '累计流量测点', value: 6 },
    { source: '设备(水表/水泵/阀门)', target: '状态测点(压力/pH/浊度)', value: 3 },
    
    // 数据入库清洗
    { source: '瞬时流量测点', target: '实时数据源定时抓取', value: 5 },
    { source: '累计流量测点', target: '实时数据源定时抓取', value: 6 },
    { source: '状态测点(压力/pH/浊度)', target: '实时数据源定时抓取', value: 3 },
    { source: '实时数据源定时抓取', target: 'TDengine (tgen) 时序底座清洗', value: 14 },

    // TDengine 计算分流 (供水测)
    { source: 'TDengine (tgen) 时序底座清洗', target: '设备最新状态展示', value: 3 },
    { source: 'TDengine (tgen) 时序底座清洗', target: '设备5分钟/1小时数据', value: 5 },
    { source: 'TDengine (tgen) 时序底座清洗', target: '切割出设备日用量', value: 6 },
    
    { source: '设备5分钟/1小时数据', target: '2-4点分区夜间最小流量', value: 5 },
    { source: '切割出设备日用量', target: '汇总出分区日/月供水量', value: 6 },
    
    // 营收售水测流转
    { source: '营收数据源接入', target: '单个用户日/月用水量', value: 6 },
    { source: '营收用户水卡', target: '单个用户日/月用水量', value: 6 },
    { source: '单个用户日/月用水量', target: '汇总出分区日/月售水量', value: 6 },

    // 产销差合流计算
    { source: '汇总出分区日/月供水量', target: '全域各分区产销差量', value: 6 },
    { source: '汇总出分区日/月售水量', target: '全域各分区产销差量', value: 6 }
  ]

  const option = {
    title: {
      text: '核心业务资产关联与工业数据流转 2D 桑基图 (Sankey)',
      subtext: '完美展现从物理台账构建、时序清洗计算到全域产销差展现的完整闭环',
      left: 'center',
      top: 10
    },
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        top: 80,
        bottom: 20,
        left: 50,
        right: 50,
        nodeGap: 15,
        nodeWidth: 20,
        focusNodeAdjacency: true,
        data: data,
        links: links,
        lineStyle: { color: 'source', curveness: 0.5, opacity: 0.4 },
        label: {
          position: 'right',
          formatter: '{b}',
          fontSize: 13,
          fontWeight: 500,
          color: '#333'
        }
      }
    ]
  }
  sankeyChart.setOption(option)
}

onMounted(() => {
  if (activeTab.value === 'sankey') {
    nextTick(() => initSankey())
  }
  
  window.addEventListener('resize', () => {
    if (sankeyChart) sankeyChart.resize()
  })
})
</script>

<style scoped>
.asset-container {
  padding: 24px;
  height: calc(100vh - 110px);
  overflow-y: auto;
  background: var(--el-bg-color-page);
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.card-header, .header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
}

.tree-card {
  min-height: 600px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.status-dot.online { background-color: var(--el-color-success); }
.status-dot.warning { background-color: var(--el-color-warning); }
.status-dot.offline { background-color: var(--el-color-danger); }

/* 展开行的测点样式 */
.point-list-wrapper {
  padding: 16px 24px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin: 8px 16px;
  border: 1px dashed var(--el-border-color);
}
.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.point-header h4 {
  margin: 0;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
