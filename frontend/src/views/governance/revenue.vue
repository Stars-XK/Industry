<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>营收数据融合清洗 (错期分摊)</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card header="日历平滑摊销算法规则" shadow="hover">
            <el-form label-width="120px">
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
              <el-form-item>
                <el-button type="primary">保存算法</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card header="高危操作：历史追溯与产销差重算" shadow="hover" style="border-color: #F56C6C;">
            <div style="padding: 10px; line-height: 1.6; color: #606266;">
              <p><strong>注意：</strong>当出现“估抄”、“坏表”并在事后获得真实水表底码后，可能会导致当月产销差失真。此功能允许回溯历史周期，重新生成水务局考核报表。</p>
            </div>
            <el-form inline>
              <el-form-item label="选择回溯月份">
                <el-date-picker v-model="recalcMonth" type="month" placeholder="如 2024-05" />
              </el-form-item>
              <el-form-item>
                <el-button type="danger" @click="handleRecalc">一键触发底层 TDengine 聚合重算</el-button>
              </el-form-item>
            </el-form>
          </el-card>
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
<style scoped>.app-container { padding: 20px; }</style>
