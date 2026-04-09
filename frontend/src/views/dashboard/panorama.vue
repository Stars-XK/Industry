<template>
  <div class="panorama-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">工业数据流转与平台治理全景图</h1>
        <p class="page-subtitle">Industrial Data Flow & Platform Governance Panorama</p>
      </div>
      <div class="header-actions">
        <el-button @click="$router.back()">返回上一页</el-button>
      </div>
    </div>

    <div class="panorama-content">
      <div class="pipeline-track">
        <!-- Step 1: 基础台账构建 -->
        <div class="track-node">
          <div class="node-icon"><el-icon><OfficeBuilding /></el-icon></div>
          <div class="node-info">
            <h4>1. 基础台账构建</h4>
            <p>建立物理与逻辑映射：部门/用户权限 ➔ 分区(DMA) ➔ 站点(水厂/泵站) ➔ 设备 ➔ 测点。建立营收水卡映射。</p>
            <div class="node-actions">
              <el-button size="small" type="primary" plain @click="$router.push('/system/org')">组织与分区</el-button>
              <el-button size="small" type="primary" plain @click="$router.push('/system/asset')">设备与测点台账</el-button>
            </div>
          </div>
        </div>

        <div class="track-connector"><el-icon><Right /></el-icon></div>

        <!-- Step 2: 实时采集与时序清洗 -->
        <div class="track-node highlight-node">
          <div class="node-icon"><el-icon><DataLine /></el-icon></div>
          <div class="node-info">
            <h4>2. 实时采集与时序底座</h4>
            <p>定时抓取底层传感数据（瞬时/累计流量、压力等），存入 TDengine 进行清洗与降采样计算。</p>
            <div class="node-actions">
              <el-button size="small" type="primary" @click="$router.push('/governance/interpolate')">时序清洗与插值规则</el-button>
            </div>
          </div>
        </div>

        <div class="track-connector"><el-icon><Right /></el-icon></div>

        <!-- Step 3: 供水量计算 -->
        <div class="track-node">
          <div class="node-icon"><el-icon><Odometer /></el-icon></div>
          <div class="node-info">
            <h4>3. 供水量与夜间流量提取</h4>
            <p>瞬时流量 ➔ 设备5分钟量 ➔ 2-4点分区MNF。<br/>累计流量 ➔ 切割出设备日用量 ➔ 汇总分区日/月供水。</p>
            <div class="node-actions">
              <el-button size="small" type="primary" plain @click="$router.push('/analytics/mnf')">全域夜间最小流量</el-button>
            </div>
          </div>
        </div>

        <div class="track-connector"><el-icon><Right /></el-icon></div>

        <!-- Step 4: 营收与售水量计算 -->
        <div class="track-node">
          <div class="node-icon"><el-icon><Money /></el-icon></div>
          <div class="node-info">
            <h4>4. 营收侧售水量融合</h4>
            <p>获取营收用户数据 ➔ 计算单用户日/月用量 ➔ 关联分区水卡信息 ➔ 汇总分区日/月售水。</p>
            <div class="node-actions">
              <el-button size="small" type="primary" plain @click="$router.push('/analytics/key-account')">大户档案与水卡</el-button>
              <el-button size="small" type="primary" plain @click="$router.push('/analytics/billing')">营收计费与出账</el-button>
            </div>
          </div>
        </div>

        <div class="track-connector"><el-icon><Right /></el-icon></div>

        <!-- Step 5: 全域展现 -->
        <div class="track-node highlight-node-success">
          <div class="node-icon"><el-icon><PieChart /></el-icon></div>
          <div class="node-info">
            <h4>5. 全域产销差计算与展现</h4>
            <p>供水减去售水得出差值。系统提供涵盖所有分区的日报、月报及产销差看板，杜绝面子工程。</p>
            <div class="node-actions">
              <el-button size="small" type="success" @click="$router.push('/analytics/nrw')">全域产销差报表</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Right, OfficeBuilding, DataLine, Odometer, Money, PieChart } from '@element-plus/icons-vue'
</script>

<style scoped>
.panorama-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background: var(--el-bg-color-page);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  font-size: 15px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.panorama-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.pipeline-track {
  display: flex;
  align-items: stretch;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--el-box-shadow-light);
  overflow-x: auto;
  width: 100%;
}

.track-node {
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s;
}

.track-node:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
  transform: translateY(-4px);
}

.track-node.highlight-node {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.track-node.highlight-node-success {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.node-icon {
  width: 56px; height: 56px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
}

.highlight-node-success .node-icon {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}

.node-info h4 { margin: 0 0 12px 0; font-size: 18px; color: var(--el-text-color-primary); }
.node-info p { margin: 0 0 20px 0; font-size: 14px; color: var(--el-text-color-regular); line-height: 1.6; flex: 1; }

.node-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.node-actions .el-button { margin-left: 0 !important; width: 100%; justify-content: center; }

.track-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: var(--el-border-color-darker);
  font-size: 32px;
}
</style>
