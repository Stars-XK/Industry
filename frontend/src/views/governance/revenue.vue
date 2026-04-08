<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">营收数据融合清洗 (错期分摊)</div>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="panel-section">
            <div class="section-title">日历平滑摊销算法规则</div>
            <div class="section-content">
              <el-form label-width="120px" label-position="left">
                <el-form-item label="计费周期">
                  <el-radio-group v-model="rule.cycle">
                    <el-radio label="1">单月抄表</el-radio>
                    <el-radio label="2">双月抄表</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="分摊方式">
                  <el-select v-model="rule.method" style="width: 100%">
                    <el-option label="按当月日历天数平均分配 (直线法)" value="linear" />
                    <el-option label="按历史日均曲线动态权重分配 (AI推荐)" value="weight" />
                  </el-select>
                </el-form-item>
                <el-form-item label="生效节点">
                  <el-date-picker v-model="rule.date" type="date" placeholder="从何时开始应用新规则" style="width: 100%" />
                </el-form-item>
                <el-form-item class="form-actions">
                  <el-button type="primary">保存算法规则</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="panel-section danger-section">
            <div class="section-title text-danger">
              <el-icon class="danger-icon"><Warning /></el-icon> 高危操作：历史追溯与产销差重算
            </div>
            <div class="section-content">
              <div class="danger-desc">
                当出现“估抄”、“坏表”并在事后获得真实水表底码后，可能会导致当月产销差失真。此功能允许回溯历史周期，重新生成水务局考核报表。
              </div>
              <el-form label-position="top">
                <el-form-item label="选择回溯月份">
                  <el-date-picker v-model="recalcMonth" type="month" placeholder="如 2024-05" style="width: 100%; max-width: 300px" />
                </el-form-item>
                <el-form-item class="form-actions" style="margin-top: 24px;">
                  <el-button type="danger" @click="handleRecalc">一键触发底层 TDengine 聚合重算</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
const rule = ref({ cycle: '2', method: 'weight', date: '' })
const recalcMonth = ref('')
const handleRecalc = () => {
  if (!recalcMonth.value) return ElMessage.warning('请选择月份')
  ElMessageBox.confirm('重算将覆盖当月产销差报表，且此操作不可逆。是否继续？', '危险操作', { type: 'error' }).then(() => {
    ElMessage.success('已下发至流计算引擎，请等待 1 分钟后刷新报表。')
  })
}
</script>
<style scoped>
.page-container {
  padding: 24px;
  background: #f4f6f8;
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.panel-section {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
  height: 100%;
}

.section-title {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
  display: flex;
  align-items: center;
}

.section-content {
  padding: 24px;
}

.danger-section {
  border-color: rgba(245, 108, 108, 0.2);
  background: #fffbfa;
}

.danger-section .section-title {
  background: rgba(245, 108, 108, 0.05);
  border-bottom-color: rgba(245, 108, 108, 0.1);
}

.text-danger {
  color: #F56C6C;
}

.danger-icon {
  margin-right: 8px;
  font-size: 16px;
}

.danger-desc {
  padding: 16px;
  background: rgba(245, 108, 108, 0.05);
  border-radius: 8px;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
  margin-bottom: 24px;
  border-left: 4px solid #F56C6C;
}

.form-actions {
  margin-bottom: 0;
  padding-top: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
