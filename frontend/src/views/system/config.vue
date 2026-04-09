<template>
  <div class="app-container config-container">
    <el-card class="box-card dark-card">
      <template #header>
        <div class="card-header">
          <span>系统参数配置 (System Configuration)</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleBatchSave">批量保存并动态生效</el-button>
          </div>
        </div>
      </template>

      <el-form :model="formData" label-width="150px" class="config-form">
        <el-divider content-position="left">基础信息配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="网站标题" prop="sys.site.title">
              <el-input v-model="formData['sys.site.title']" placeholder="如：信创工业综合治理平台" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统LOGO" prop="sys.site.logo">
              <el-input v-model="formData['sys.site.logo']" placeholder="Logo 图片路径，如：/logo.png" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">GIS 地图引擎配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地图来源" prop="sys.map.source">
              <el-select v-model="formData['sys.map.source']" placeholder="选择地图底层">
                <el-option label="高德地图 (Amap)" value="amap" />
                <el-option label="百度地图 (Baidu)" value="baidu" />
                <el-option label="天地图 (Tianditu)" value="tianditu" />
                <el-option label="离线内网自建服务" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认中心点坐标" prop="sys.map.center">
              <el-input v-model="formData['sys.map.center']" placeholder="[经度, 纬度]，如：[118.67, 24.87]" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">通知通道配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SMTP 邮件服务器" prop="sys.mail.smtp">
              <el-input v-model="formData['sys.mail.smtp']" placeholder="如：smtp.163.com" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getGlobalConfig, batchUpdateConfig } from '@/api/system/config';
import { useConfigStore } from '@/store/config';

const formData = ref<Record<string, string>>({});
const configStore = useConfigStore();

// 页面加载时获取全量配置
const fetchConfig = async () => {
  try {
    const res = await getGlobalConfig();
    if (res) {
      formData.value = res as unknown as Record<string, string>;
    }
  } catch (error) {
    console.error('获取配置失败:', error);
  }
};

onMounted(() => {
  fetchConfig();
});

// 批量保存并通知全局状态更新
const handleBatchSave = async () => {
  try {
    // 转换为后端需要的批量格式
    const payload = Object.keys(formData.value).map(key => ({
      configKey: key,
      configValue: formData.value[key]
    }));

    await batchUpdateConfig(payload);
    ElMessage.success('保存成功，全局配置已动态生效');
    
    // 触发 Pinia 更新内存状态，UI 会自动响应式刷新
    await configStore.fetchGlobalConfig();
  } catch (error) {
    ElMessage.error('保存失败');
  }
};
</script>

<style scoped>
.config-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.config-form {
  margin-top: 20px;
}
.dark-card {
  background-color: #1e1e2f;
  color: #fff;
  border: 1px solid #333;
}
</style>
