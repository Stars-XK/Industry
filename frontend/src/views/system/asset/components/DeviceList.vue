<template>
  <div class="device-list">
    <div class="table-toolbar" style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
      <el-button type="primary" icon="Connection" @click="$emit('add-device')">从台账库中挂载设备</el-button>
    </div>
    <div v-for="device in deviceList" :key="device.id" class="device-item">
      <div class="device-header">
        <div class="device-info">
          <div class="status-indicator" :class="device.status === '在线' ? 'online' : 'offline'"></div>
          <h3 class="device-name">{{ device.deviceName }}</h3>
          <span class="device-code">{{ device.deviceCode }}</span>
          <span class="device-type-badge">{{ device.deviceType }}</span>
        </div>
        <div class="device-actions">
          <span class="install-date">安装日期: {{ device.installDate }}</span>
          <el-button link class="text-action" @click="handleEditDevice(device)">编辑信息</el-button>
          <el-button link class="text-action">换表接续</el-button>
          <el-button link class="text-action danger" @click="$emit('remove-device', device)">解除挂载</el-button>
        </div>
      </div>
      
      <!-- Measuring Points -->
      <div class="points-grid" v-if="device.points && device.points.length > 0">
        <div class="points-header">
          <h4>输出测点 (Measuring Points)</h4>
          <el-button link class="text-action small" icon="Connection" @click="$emit('add-point', device)">绑定已有测点</el-button>
        </div>
        <div class="points-table-wrapper">
          <table class="sleek-table">
            <thead>
              <tr>
                <th>测点编码</th>
                <th>测点名称</th>
                <th>数据类型</th>
                <th>单位</th>
                <th>更新时间</th>
                <th class="align-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="point in device.points" :key="point.pointCode">
                <td class="mono">{{ point.pointCode }}</td>
                <td class="strong">{{ point.pointName }}</td>
                <td>
                  <span class="type-dot" :class="getPointColorClass(point.pointType)"></span>
                  {{ point.pointType }}
                </td>
                <td class="mono">{{ point.unit || '-' }}</td>
                <td class="mono subtle">{{ point.updateTime }}</td>
                <td class="align-right">
                  <el-button link class="text-action small">配置映射</el-button>
                  <el-button link class="text-action danger small" @click="handleDeletePoint(device, point)">删除</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="empty-points" v-else>
        <p>该设备暂未配置任何物理输出测点。</p>
        <el-button link type="primary" icon="Connection" @click="$emit('add-point', device)">绑定测点</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

defineProps<{
  deviceList: any[]
}>()

const emit = defineEmits(['add-device', 'edit-device', 'remove-device', 'add-point', 'edit-point', 'remove-point'])


const getPointColorClass = (type: string) => {
  const map: any = {
    'Boolean': 'blue',
    'Float': 'green',
    'Integer': 'orange',
    'String': 'purple'
  }
  return map[type] || 'gray'
}
</script>

<style scoped>
.device-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-list-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.device-item {
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
  background: #fafafa;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-indicator.online { background-color: var(--el-color-success); box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2); }
.status-indicator.offline { background-color: var(--el-color-danger); box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2); }

.device-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.device-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #687076;
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.device-type-badge {
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.device-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.install-date {
  font-size: 13px;
  color: #889096;
}

.text-action {
  font-size: 13px;
  font-weight: 500;
  color: #11181c;
  padding: 0;
}
.text-action:hover { color: var(--el-color-primary); }
.text-action.danger { color: var(--el-color-danger); }

.points-grid {
  padding: 16px 20px;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.points-header h4 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #687076;
  margin: 0;
}

.sleek-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.sleek-table th {
  padding: 8px 12px;
  color: #889096;
  font-weight: 500;
  border-bottom: 1px solid #eaeaea;
}

.sleek-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f5;
  color: #11181c;
}

.sleek-table tr:last-child td {
  border-bottom: none;
}

.sleek-table .mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #687076;
}

.sleek-table .subtle {
  color: #687076;
}

.align-right {
  text-align: right;
}

.type-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}
.type-dot.blue { background-color: var(--el-color-primary); }
.type-dot.green { background-color: var(--el-color-success); }
.type-dot.orange { background-color: var(--el-color-warning); }
.type-dot.gray { background-color: #889096; }

.empty-points {
  padding: 24px;
  text-align: center;
  color: #889096;
  font-size: 13px;
}

.empty-points p {
  margin: 0 0 12px 0;
}
</style>
