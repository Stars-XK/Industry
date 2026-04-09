<template>
  <div class="app-container">
    <el-card class="box-card dark-card">
      <template #header>
        <div class="card-header">
          <span>数据库备份与恢复</span>
          <div class="header-actions" style="display: flex; gap: 10px;">
            <el-upload
              action="/api/v1/system/backup/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
            >
              <el-button type="success" :loading="loading">上传外部SQL备份</el-button>
            </el-upload>
            <el-button type="primary" :loading="loading" @click="handleCreateBackup">执行手动备份</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border style="width: 100%" class="dark-table">
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
            <el-button type="primary" link :disabled="scope.row.status !== 1" @click="handleDownload(scope.row)">下载</el-button>
            <el-popconfirm
              title="确定要使用该备份文件恢复整个数据库吗？此操作不可逆！"
              @confirm="handleRestore(scope.row)"
            >
              <template #reference>
                <el-button type="danger" link :disabled="scope.row.status !== 1">一键恢复</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
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
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
