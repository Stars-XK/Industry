<template>
  <div class="page-container scada-topology">
    <el-row :gutter="20" style="height: 100%;">
      <!-- 左侧拓扑树 -->
      <el-col :span="6" style="height: 100%;">
        <el-card class="box-card" shadow="never" style="height: 100%;">
          <template #header>
            <div class="card-header">
              <span>供水 DMA 拓扑导航</span>
            </div>
          </template>
          <div class="tree-container" v-loading="loading" element-loading-text="Thinking..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
            <el-tree
              :data="treeData"
              :props="defaultProps"
              node-key="id"
              default-expand-all
              @node-click="handleNodeClick"
              highlight-current
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <el-icon v-if="data.level === 1"><House /></el-icon>
                  <el-icon v-else-if="data.level === 2"><OfficeBuilding /></el-icon>
                  <el-icon v-else><Location /></el-icon>
                  <span style="margin-left: 8px;">{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详情/设备列表区 -->
      <el-col :span="18" style="height: 100%;">
        <el-card class="box-card" shadow="never" style="height: 100%;">
          <template #header>
            <div class="card-header">
              <span>分区设备关联信息</span>
              <el-tag v-if="currentNode" type="success">{{ currentNode.label }}</el-tag>
            </div>
          </template>
          <div v-if="!currentNode" class="empty-tip">
            <el-empty description="请从左侧选择一个 DMA 分区" />
          </div>
          <div v-else>
            <el-descriptions title="分区详情" :column="3" border>
              <el-descriptions-item label="分区ID">{{ currentNode.id }}</el-descriptions-item>
              <el-descriptions-item label="分区名称">{{ currentNode.label }}</el-descriptions-item>
              <el-descriptions-item label="层级">
                <el-tag size="small">{{ currentNode.level }} 级分区</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            
            <h3 style="margin-top: 30px;">挂载设备清单</h3>
            <el-table 
              :data="deviceList" 
              style="width: 100%; margin-top: 10px;" 
              border
              v-loading="deviceLoading"
              element-loading-text="Thinking..." 
              element-loading-spinner="el-icon-loading" 
              element-loading-background="rgba(0, 0, 0, 0.8)"
            >
              <el-table-column prop="id" label="内部ID" width="80" />
              <el-table-column prop="device_code" label="资产编号" width="160" />
              <el-table-column prop="name" label="设备名称" />
              <el-table-column prop="type_name" label="设备类型" width="120">
                <template #default="{ row }">
                  <el-tag type="info">{{ row.type_name }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="direction" label="流向(针对流量计)" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.direction === '流入'" type="success">流入</el-tag>
                  <el-tag v-else-if="row.direction === '流出'" type="danger">流出</el-tag>
                  <el-tag v-else type="warning">内部</el-tag>
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
import { ref, onMounted } from 'vue'
import { House, OfficeBuilding, Location } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const deviceLoading = ref(false)
const treeData = ref([])
const deviceList = ref([])
const defaultProps = {
  children: 'children',
  label: 'label',
}
const currentNode = ref<any>(null)

const getTree = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/scada/topology/tree')
    treeData.value = res || []
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
    deviceList.value = res || []
  } catch (error) {
    console.error(error)
  } finally {
    deviceLoading.value = false
  }
}

const handleNodeClick = (data: any) => {
  currentNode.value = data
  getDevices(data.id)
}

onMounted(() => {
  getTree()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: calc(100vh - 100px);
  box-sizing: border-box;
}
.box-card {
  display: flex;
  flex-direction: column;
}
:deep(.el-card__body) {
  flex: 1;
  overflow: auto;
}
.tree-container {
  height: 100%;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.empty-tip {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
