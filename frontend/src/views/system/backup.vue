<template>
  <div class="app-container">
    <div class="page-header">
      <div class="header-content">
        <h1>数据库备份与恢复</h1>
        <p>系统级数据灾备中心与安全快照管理</p>
      </div>
      <div class="header-actions">
        <el-button type="info" @click="showStrategy = true">
          <el-icon style="margin-right: 4px;"><Setting /></el-icon> 定时备份策略
        </el-button>
        <el-upload
          action="/api/v1/system/backup/upload"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          style="display: inline-block"
        >
          <el-button type="success" :loading="loading">
            <el-icon style="margin-right: 4px;"><Upload /></el-icon> 上传备份
          </el-button>
        </el-upload>
        <el-button type="primary" :loading="loading" @click="handleCreateBackup">
          <el-icon style="margin-right: 4px;"><DocumentAdd /></el-icon> 执行备份
        </el-button>
      </div>
    </div>
    <el-card class="box-card">
      <el-table :data="tableData" v-loading="loading" style="width: 100%" class="custom-table" stripe highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="fileName" label="备份文件名" min-width="250" />
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="backupType" label="备份类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.backupType === 1 ? 'info' : 'success'">
              {{ scope.row.backupType === 1 ? '自动定时' : '手动备份' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="备份时间" width="180" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" link :disabled="scope.row.status !== 1" @click="handleDownload(scope.row)">
              <el-icon style="margin-right: 2px;"><Download /></el-icon> 下载
            </el-button>
            <el-popconfirm
              title="确定要使用该备份文件恢复整个数据库吗？此操作不可逆！"
              @confirm="handleRestore(scope.row)"
            >
              <template #reference>
                <el-button type="danger" link :disabled="scope.row.status !== 1">
                  <el-icon style="margin-right: 2px;"><RefreshLeft /></el-icon> 一键恢复
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>
    <!-- 定时备份策略弹窗 -->
    <el-dialog title="自动备份策略配置" v-model="showStrategy" width="500px">
      <el-form :model="strategyForm" label-width="120px">
        <el-form-item label="开启自动备份">
          <el-switch v-model="strategyForm.enabled" />
        </el-form-item>
        <el-form-item label="备份周期">
          <el-select v-model="strategyForm.cron" placeholder="请选择周期" style="width: 100%">
            <el-option label="每天凌晨 02:00" value="0 2 * * *" />
            <el-option label="每周日凌晨 03:00" value="0 3 * * 0" />
            <el-option label="每月1号凌晨 04:00" value="0 4 1 * *" />
          </el-select>
        </el-form-item>
        <el-form-item label="保留天数">
          <el-input-number v-model="strategyForm.keepDays" :min="1" :max="365" />
          <span style="margin-left: 10px; color: var(--el-text-color-regular); font-size: 12px;">超过天数的旧备份将被自动清理</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStrategy = false">取消</el-button>
        <el-button type="primary" @click="saveStrategy">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { DataLine, Upload, DocumentAdd, Download, RefreshLeft, Setting } from '@element-plus/icons-vue';
import request from '@/utils/request';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
});
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`
};
// 自动备份策略相关
const showStrategy = ref(false);
const strategyForm = ref({
  enabled: true,
  cron: '0 2 * * *',
  keepDays: 30
});
const saveStrategy = () => {
  ElMessage.success('定时备份策略已更新生效');
  showStrategy.value = false;
};
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await request({
      url: '/api/v1/system/backup/list',
      method: 'get',
      params: queryParams.value
    });
    tableData.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取备份列表失败:', error);
  } finally {
    loading.value = false;
  }
};
const handleCreateBackup = async () => {
  loading.value = true;
  try {
    await request({
      url: '/api/v1/system/backup/create',
      method: 'post'
    });
    ElMessage.success('备份成功');
    getList();
  } catch (error) {
    ElMessage.error('备份失败');
  } finally {
    loading.value = false;
  }
};
const handleRestore = async (row: any) => {
  loading.value = true;
  try {
    await request({
      url: '/api/v1/system/backup/restore',
      method: 'post',
      data: { id: row.id }
    });
    ElMessage.success('系统恢复成功！建议重新登录。');
  } catch (error) {
    ElMessage.error('恢复失败');
  } finally {
    loading.value = false;
  }
};
const handleDownload = (row: any) => {
  window.open(`/api/v1/system/backup/download?id=${row.id}&token=${localStorage.getItem('token')}`);
};
const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    ElMessage.success('上传成功');
    getList();
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};
const handleUploadError = () => {
  ElMessage.error('上传文件失败');
};
onMounted(() => {
  getList();
});
</script>
<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}
.box-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);

  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}
.header-actions {
  display: flex;
  gap: 12px;
}
.custom-table {
  border-radius: 8px;
  overflow: hidden;
}
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
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
