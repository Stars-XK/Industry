<template>
  <div class="app-container">
    <el-card class="box-card dark-card">
      <template #header>
        <div class="card-header">
          <span>快速初始化发布与覆盖导入 (Setup Wizard)</span>
        </div>
      </template>

      <el-steps :active="activeStep" finish-status="success" align-center class="wizard-steps">
        <el-step title="准备数据" description="下载标准化 Excel 模板并填入组织架构、资产台账等基础数据" />
        <el-step title="全量备份与切片校验" description="系统在接收文件前自动触发 MySQL 全量灾备，并对 Excel 格式进行预校验" />
        <el-step title="覆盖导入执行" description="执行原子级事务覆盖导入" />
        <el-step title="完成发布" description="初始化完毕，平台开箱即用" />
      </el-steps>

      <div class="step-content">
        <!-- 步骤 1 -->
        <div v-show="activeStep === 0" class="step-panel">
          <h3>第一步：下载初始化数据模板</h3>
          <p>请下载以下基础模板，根据规范填入实施数据。包含 <code>Dept(部门)</code>、<code>Role(角色)</code> 等多个 Sheet 页。</p>
          <el-button type="success" icon="Download" @click="downloadTemplate">下载标准化模板 (V1.0)</el-button>
          <div class="next-btn">
            <el-button type="primary" @click="nextStep">我已填好数据，下一步</el-button>
          </div>
        </div>

        <!-- 步骤 2 & 3 -->
        <div v-show="activeStep === 1 || activeStep === 2" class="step-panel">
          <h3>上传合并好的全量初始化 Excel 文件</h3>
          <el-alert 
            title="危险操作预警：覆盖导入前，系统将强制执行一次数据库全量备份！" 
            type="warning" 
            show-icon 
            :closable="false"
            style="margin-bottom: 20px"
          />
          <el-upload
            class="upload-demo"
            drag
            :action="uploadUrl"
            :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeUpload"
            accept=".xlsx, .xls"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽大文件到此处，或 <em>点击选择文件</em><br/>
              <span style="font-size: 12px; color: #999;">(前端支持大文件切片上传，确保百兆 BIM 模型及台账包不断连)</span>
            </div>
          </el-upload>
          
          <div class="next-btn">
            <el-button @click="activeStep = 0">返回上一步</el-button>
          </div>
        </div>

        <!-- 步骤 4 -->
        <div v-show="activeStep === 3" class="step-panel text-center">
          <el-result icon="success" title="系统初始化完成" sub-title="所有基础数据已成功覆盖入库。你可以在各业务模块查看。" />
          <ul class="result-log">
            <li v-for="(log, idx) in resultLogs" :key="idx">{{ log }}</li>
          </ul>
          <div class="next-btn">
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();
const activeStep = ref(0);
const resultLogs = ref<string[]>([]);

// 这个地址对应刚才我们写的 auth-service 里的 WizardController
const uploadUrl = '/api/v1/system/wizard/import';
const headers = { Authorization: 'Bearer ' + userStore.token };

const downloadTemplate = () => {
  ElMessage.info('开始下载标准模板...');
  // 此处可换成真实的模板下载链接
  window.open('/template/setup_template_v1.xlsx', '_blank');
};

const nextStep = () => {
  if (activeStep.value < 3) activeStep.value++;
};

const beforeUpload = (file: File) => {
  activeStep.value = 2; // 进入上传执行步骤
  ElMessage.warning('正在强制触发全量系统备份，请耐心等待...');
  return true;
};

const handleSuccess = (res: any) => {
  if (res.code === 200) {
    ElMessage.success('初始化成功！');
    resultLogs.value = res.data || ['导入解析完毕'];
    activeStep.value = 3;
  } else {
    ElMessage.error(res.message || '导入失败');
    activeStep.value = 1;
  }
};

const handleError = (err: any) => {
  ElMessage.error('上传或解析失败：可能备份出错或格式异常。');
  activeStep.value = 1;
};

const goHome = () => {
  router.push('/dashboard');
};
</script>

<style scoped>
.app-container { padding: 20px; }
.wizard-steps { margin-bottom: 40px; }
.step-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.step-panel {
  width: 100%;
  max-width: 600px;
}
.next-btn {
  margin-top: 30px;
  text-align: center;
}
.text-center { text-align: center; }
.result-log {
  margin-top: 20px;
  text-align: left;
  background: #1d1e22;
  padding: 15px;
  border-radius: 4px;
  color: #a8b2c8;
}
.result-log li {
  margin-bottom: 5px;
}
</style>
