<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-icon style="margin-right: 8px; vertical-align: middle;"><Connection /></el-icon>多源异构数据源接入配置</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon style="margin-right: 4px;"><Plus /></el-icon> 新增接入
          </el-button>
        </div>
      </template>
      <el-row :gutter="20" style="margin-bottom: 24px;">
        <el-col :span="6" v-for="channel in statusData.channels" :key="channel.protocol">
          <el-card shadow="hover" class="status-card" :class="channel.status">
            <div class="channel-title">{{ channel.protocol }}</div>
            <div class="channel-stat">
              <span style="color: var(--el-text-color-secondary)">QPS</span>
              <span style="font-weight: 500">{{ channel.currentQps }}</span>
            </div>
            <div class="channel-stat">
              <span style="color: var(--el-text-color-secondary)">堆积</span>
              <span style="font-weight: 500" :style="{ color: channel.lag > 0 ? '#ef4444' : 'inherit' }">{{ channel.lag }}</span>
            </div>
            <div class="channel-stat">
              <span style="color: var(--el-text-color-secondary)">在线时长</span>
              <span style="font-weight: 500">{{ channel.uptime }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-table :data="tableData" border style="width: 100%" class="custom-table" v-loading="loading" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="sourceName" label="数据源名称" />
        <el-table-column prop="sourceType" label="接入类型" width="120" />
        <el-table-column prop="cronExpression" label="定时采集频率" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">
              <el-icon style="margin-right: 2px;"><Edit /></el-icon> 编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">
              <el-icon style="margin-right: 2px;"><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="form.sourceName" placeholder="如: 外部 ERP HTTP 接口" />
        </el-form-item>
        <el-form-item label="接入类型" prop="sourceType">
          <el-select v-model="form.sourceType" style="width: 100%;">
            <el-option label="HTTP API" value="http" />
            <el-option label="Kafka 消息队列" value="kafka" />
            <el-option label="MySQL 数据库" value="mysql" />
            <el-option label="PostgreSQL" value="pg" />
            <el-option label="Oracle" value="oracle" />
            <el-option label="达梦数据库 (DM)" value="dm" />
          </el-select>
        </el-form-item>
        <el-form-item label="定时表达式" prop="cronExpression">
          <el-input v-model="form.cronExpression" placeholder="如: */10 * * * * *" />
        </el-form-item>
        <el-form-item label="连接配置 (JSON)" prop="connectionConfig">
          <el-input type="textarea" v-model="form.connectionConfig" :rows="4" placeholder='{"url": "http://api.erp.com/data", "token": "xxx"}' />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="form.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Connection, Plus, Edit, Delete } from '@element-plus/icons-vue';
import request from '@/utils/request';
const loading = ref(false);
const statusData = ref({ channels: [] });
const tableData = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref();
const form = ref<any>({
  status: 1
});
const rules = {
  sourceName: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择类型', trigger: 'change' }]
};
const getStatus = async () => {
  try {
    const res = await request.get('/api/v1/data-center/governance/integration/status');
    statusData.value = res || { channels: [] };
  } catch (e) {
    console.error(e);
  }
};
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await request.get('/api/v1/data-center/governance/integration/list');
    tableData.value = res.list || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
const handleAdd = () => {
  dialogTitle.value = '新增数据源接入';
  form.value = { status: 1 };
  dialogVisible.value = true;
};
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑数据源';
  form.value = { ...row };
  dialogVisible.value = true;
};
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该数据源吗?', '提示', { type: 'warning' }).then(async () => {
    await request.delete('/api/v1/data-center/governance/integration/' + row.id);
    ElMessage.success('删除成功');
    getList();
  }).catch(() => {});
};
const submitForm = async () => {
  await formRef.value.validate();
  if (form.value.id) {
    await request.put('/api/v1/data-center/governance/integration', form.value);
    ElMessage.success('修改成功');
  } else {
    await request.post('/api/v1/data-center/governance/integration', form.value);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};
onMounted(() => {
  getStatus();
  getList();
});
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
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-card {
  text-align: center;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-light);
  box-shadow: var(--el-box-shadow-light);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.status-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow);
}
.status-card.connected {
  border-left: 4px solid #10b981; /* Emerald 500 */
}
.status-card.warning {
  border-left: 4px solid #f59e0b; /* Amber 500 */
}
.channel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}
.channel-stat {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 2;
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
}
.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 24px;
}
/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 500;
}
</style>
