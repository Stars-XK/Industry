<template>
  <div class="site-list">
    <div class="table-toolbar" style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
      <el-button type="primary" icon="Plus" @click="$emit('add-site')">注册物理站点</el-button>
    </div>
    <el-table :data="siteList" border stripe style="width: 100%;">
      <el-table-column prop="site_code" label="站点编码" width="180" />
      <el-table-column prop="site_name" label="站点名称" />
      <el-table-column label="站点类型" width="180">
        <template #default="{ row }">
          <span class="node-type-badge site-badge">{{ getSiteTypeName(row.site_type) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link class="text-action" @click="viewSiteDevices(row)">查看设备台账</el-button>
          <el-button link class="text-action danger" @click="deleteSite(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  siteList: any[]
}>()

const emit = defineEmits(['view-devices', 'delete-site', 'add-site'])

const getSiteTypeName = (type: unknown) => {
  if (typeof type === 'string' && type.trim()) return type
  const n = Number(type)
  const map: Record<number, string> = { 1: '水厂', 2: '加压泵站', 3: '二供泵房', 4: '管网监测点' }
  return map[n] || '物理站点'
}

const viewSiteDevices = (row: any) => {
  emit('view-devices', row)
}

const deleteSite = (row: any) => {
  emit('delete-site', row)
}
</script>

<style scoped>
.site-list {
  width: 100%;
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
.site-badge {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  border-color: var(--el-color-warning-light-5);
}
.text-action {
  font-size: 13px;
  font-weight: 500;
  color: #11181c;
  padding: 0;
}
.text-action:hover { color: var(--el-color-primary); }
.text-action.danger { color: var(--el-color-danger); }
</style>
