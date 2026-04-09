
<template>
  <div class="app-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">系统快速接入与业务指南</h1>
        <p class="page-subtitle">Platform Onboarding & Workflow Guide</p>
      </div>
    </div>

    <el-card class="box-card workflow-card">
      <div class="workflow-intro">
        <h2>如何接入外部设备并产生价值？</h2>
        <p>很多用户初次使用系统时，不知道数据如何流转。我们的核心理念是 <strong>"模型驱动，数据解耦"</strong>。请按照以下标准的工业接入生命周期进行操作：</p>
      </div>

      <div class="pipeline-container">
        <!-- 步骤1 -->
        <div class="pipeline-step">
          <div class="step-icon"><el-icon><DataLine /></el-icon></div>
          <div class="step-content-box">
            <h3>1. 资产与设备台账建档</h3>
            <p>首先，你需要告诉系统"有什么东西"。在资产台账中创建物理设备（如：水泵、流量计），它们是所有数据的载体。</p>
            <el-button type="primary" link @click="router.push('/system/asset')">去建档 <el-icon><Right /></el-icon></el-button>
          </div>
          <div class="step-arrow"><el-icon><ArrowRightBold /></el-icon></div>
        </div>

        <!-- 步骤2 -->
        <div class="pipeline-step">
          <div class="step-icon"><el-icon><Connection /></el-icon></div>
          <div class="step-content-box">
            <h3>2. 异构数据源接入 (集成外部PG库等)</h3>
            <p>去"多源异构数据接入"配置外部数据库(如甲方的 PostgreSQL/MySQL)或 OPC-UA 的连接信息，将外部数据池与系统打通。</p>
            <el-button type="primary" link @click="router.push('/governance/integration')">去接入 <el-icon><Right /></el-icon></el-button>
          </div>
          <div class="step-arrow"><el-icon><ArrowRightBold /></el-icon></div>
        </div>

        <!-- 步骤3 -->
        <div class="pipeline-step">
          <div class="step-icon"><el-icon><Guide /></el-icon></div>
          <div class="step-content-box">
            <h3>3. 边缘网关与点位映射</h3>
            <p>创建"边缘网关"，在"传感器标签映射"中，将外部采集来的原始数据列（如 tag_001），绑定到你在第一步建立的资产属性上。</p>
            <el-button type="primary" link @click="router.push('/system/gateway')">去映射 <el-icon><Right /></el-icon></el-button>
          </div>
          <div class="step-arrow"><el-icon><ArrowRightBold /></el-icon></div>
        </div>

        <!-- 步骤4 -->
        <div class="pipeline-step">
          <div class="step-icon"><el-icon><Filter /></el-icon></div>
          <div class="step-content-box">
            <h3>4. 数据清洗与插值入库 (TDengine)</h3>
            <p>在数据治理模块，配置清洗规则。脏数据会被剔除，缺失数据会通过 AI 插值修补，最终标准化的时序数据会落入内部的时序数据库。</p>
            <el-button type="primary" link @click="router.push('/governance/interpolate')">配规则 <el-icon><Right /></el-icon></el-button>
          </div>
          <div class="step-arrow"><el-icon><ArrowRightBold /></el-icon></div>
        </div>

        <!-- 步骤5 -->
        <div class="pipeline-step">
          <div class="step-icon"><el-icon><Monitor /></el-icon></div>
          <div class="step-content-box">
            <h3>5. 组态与分析应用展现</h3>
            <p>数据准备就绪后，你就可以在 SCADA 低代码画布中拖拽图元绑定这些数据，或者在"产销差"与"最小夜间流量"中看到最终的图表了！</p>
            <el-button type="primary" link @click="router.push('/scada/topology')">去画布 <el-icon><Right /></el-icon></el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 原有的快速初始化面板作为高级选项收起 -->
    <el-collapse class="advanced-collapse" style="margin-top: 24px; border: none;">
      <el-collapse-item name="1">
        <template #title>
          <div class="advanced-title">
            <el-icon style="margin-right: 8px;"><MagicStick /></el-icon> 
            高级选项：旧版 Excel 快速覆盖导入向导
          </div>
        </template>
        <el-card class="box-card shadow-none">
          <el-steps :active="activeStep" finish-status="success" align-center class="wizard-steps">
            <el-step title="准备数据" description="下载标准化 Excel 模板" />
            <el-step title="全量备份与切片校验" description="强制系统灾备并预校验" />
            <el-step title="覆盖导入执行" description="原子级事务导入" />
            <el-step title="完成发布" description="平台开箱即用" />
          </el-steps>
          <div class="step-content">
            <div v-show="activeStep === 0" class="step-panel">
              <h3>第一步：下载初始化数据模板</h3>
              <p>请下载以下基础模板，根据规范填入实施数据。</p>
              <el-button type="success" size="large" @click="downloadTemplate">
                <el-icon style="margin-right: 6px;"><Download /></el-icon>下载标准化模板
              </el-button>
              <div class="next-btn">
                <el-button type="primary" size="large" @click="nextStep">我已填好数据，下一步 <el-icon><Right /></el-icon></el-button>
              </div>
            </div>
            <div v-show="activeStep === 1 || activeStep === 2" class="step-panel">
              <h3>上传合并好的全量初始化 Excel 文件</h3>
              <el-upload
                class="upload-demo" drag :action="uploadUrl" :headers="headers"
                :on-success="handleSuccess" :on-error="handleError" :before-upload="beforeUpload" accept=".xlsx, .xls"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">拖拽大文件到此处，或 <em>点击选择文件</em></div>
              </el-upload>
              <div class="next-btn">
                <el-button @click="activeStep = 0" size="large">返回上一步</el-button>
              </div>
            </div>
            <div v-show="activeStep === 3" class="step-panel text-center">
              <el-result icon="success" title="系统初始化完成" />
              <div class="next-btn">
                <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Download, MagicStick, Right, ArrowRightBold, HomeFilled, DataLine, Connection, Guide, Filter, Monitor } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();
const activeStep = ref(0);
const resultLogs = ref<string[]>([]);
const uploadUrl = '/api/v1/system/wizard/import';
const headers = { Authorization: 'Bearer ' + userStore.token };

const downloadTemplate = () => {
  ElMessage.info('开始下载标准模板…');
  window.open('/template/setup_template_v1.xlsx', '_blank');
};
const nextStep = () => { if (activeStep.value < 3) activeStep.value++; };
const beforeUpload = (file: File) => { activeStep.value = 2; return true; };
const handleSuccess = (res: any) => {
  if (res.code === 200) { ElMessage.success('成功！'); activeStep.value = 3; } 
  else { ElMessage.error('失败'); activeStep.value = 1; }
};
const handleError = () => { activeStep.value = 1; };
const goHome = () => { router.push('/dashboard'); };
</script>



<style scoped>
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}
.page-subtitle {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}
.workflow-card {
  padding: 32px;
  background: var(--el-bg-color);
}
.workflow-intro {
  text-align: center;
  margin-bottom: 40px;
}
.workflow-intro h2 {
  font-size: 24px;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}
.workflow-intro p {
  color: var(--el-text-color-regular);
  font-size: 15px;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}
.pipeline-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}
.pipeline-step {
  display: flex;
  align-items: stretch;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}
.pipeline-step:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}
.step-icon {
  width: 48px;
  height: 48px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
  flex-shrink: 0;
}
html.dark .step-icon {
  background: var(--el-color-primary-dark-2);
}
.step-content-box {
  flex: 1;
}
.step-content-box h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}
.step-content-box p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}
.step-arrow {
  display: flex;
  align-items: center;
  color: var(--el-text-color-placeholder);
  font-size: 20px;
  padding-left: 16px;
}
.advanced-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.shadow-none { box-shadow: none !important; border: none; }
.step-content { min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
.step-panel { width: 100%; max-width: 600px; text-align: center; }
</style>

