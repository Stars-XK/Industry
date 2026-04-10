<template>
  <aside class="hierarchy-sidebar">
    <div class="sidebar-header">
      <h2>组织与站点架构</h2>
      <el-input 
        v-model="filterText" 
        placeholder="搜索分区..." 
        clearable 
        class="sleek-input"
        prefix-icon="Search"
      />
    </div>
    <div class="tree-container custom-scrollbar">
      <el-tree
        ref="treeRef"
        :data="zoneTree"
        :props="defaultProps"
        :filter-node-method="filterNode"
        node-key="id"
        default-expand-all
        highlight-current
        class="sleek-tree"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-icon zone">
              <el-icon :size="14"><MapLocation /></el-icon>
            </div>
            <span class="node-label">{{ node.label }}</span>
            <span class="node-type-badge">{{ data.zoneType || 'DMA分区' }}</span>
            <el-dropdown trigger="click" @command="handleCommand($event, data)" placement="bottom-end">
              <span class="node-actions" @click.stop>
                <el-icon><More /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="addZone">添加子分区</el-dropdown-item>
                  <el-dropdown-item command="addSite">添加物理站点</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑节点信息</el-dropdown-item>
                  <el-dropdown-item command="delete" divided class="text-danger">删除该节点</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-tree>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { MapLocation, Search, More } from '@element-plus/icons-vue'
import request from '@/utils/request'

const emit = defineEmits(['node-click', 'command'])

const filterText = ref('')
const treeRef = ref<any>(null)
const zoneTree = ref<any[]>([])

const defaultProps = {
  children: 'children',
  label: 'label',
}

const fetchTreeData = async () => {
  try {
    const res = await request.get('/api/v1/system/zone/tree')
    zoneTree.value = res || []
  } catch (error) {
    console.error('Failed to fetch zone tree:', error)
  }
}

onMounted(() => {
  fetchTreeData()
})

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

const handleNodeClick = (data: any) => {
  emit('node-click', data)
}

const handleCommand = (command: string, data: any) => {
  emit('command', command, data)
}

// 暴露刷新方法给父组件
defineExpose({ fetchTreeData })
</script>

<style scoped>
.hierarchy-sidebar {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
}

.sidebar-header h2 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #687076;
  margin: 0 0 16px 0;
}

.sleek-input :deep(.el-input__wrapper) {
  background-color: #f1f3f5;
  box-shadow: none;
  border-radius: 6px;
}
.sleek-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  background-color: #fff;
}
.sleek-input.small :deep(.el-input__wrapper) {
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #eaeaea inset;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
}

.sleek-tree {
  background: transparent;
}
.sleek-tree :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 6px;
  margin-bottom: 2px;
}
.sleek-tree :deep(.el-tree-node__content:hover) {
  background-color: transparent;
}
.sleek-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
  font-weight: 500;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #889096;
}
.node-icon svg {
  opacity: 0.85;
}
.node-icon.org { color: var(--el-color-primary); }
.node-icon.zone { color: var(--el-color-success); }
.node-icon.site { color: var(--el-color-warning); }

.node-icon .el-icon {
  font-size: 14px !important;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}
.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-badge {
  background: #eaeaea;
  color: #687076;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 12px;
  margin-right: 8px;
  font-weight: 600;
}

.node-type-badge {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
  font-weight: 500;
  border: 1px solid var(--el-color-primary-light-5);
}

.node-actions {
  display: none;
  cursor: pointer;
  color: #889096;
  padding: 2px 4px;
  border-radius: 4px;
}
.node-actions:hover {
  background: #eaeaea;
  color: #11181c;
}
.sleek-tree :deep(.el-tree-node__content:hover) .node-actions {
  display: flex;
  align-items: center;
}
</style>
