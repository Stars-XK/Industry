<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>在线水力模型仿真与推演 (EPANET)</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form label-position="top">
            <el-form-item label="选择沙盘推演场景">
              <el-select v-model="scenario" style="width: 100%">
                <el-option label="模拟 V-05 阀门关闭检修" value="close_v05" />
                <el-option label="模拟 1号泵房停电" value="pump_down" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%">开始推演</el-button>
            </el-form-item>
          </el-form>
          <div class="result-panel">
            <h4>推演结果影响面</h4>
            <p style="color: #F56C6C">受影响车间: 3个</p>
            <p style="color: #E6A23C">压力不足节点: 12个</p>
            <p>最大水压降幅: 0.15 MPa</p>
            <el-button type="warning" size="small" style="margin-top: 10px">一键转抢修SOP</el-button>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="map-placeholder">
            <p>GIS 水压等值线云图渲染区 (WebMap)</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const scenario = ref('close_v05')
</script>
<style scoped>
.app-container { padding: 20px; }
.map-placeholder { background: #f0f2f5; height: 500px; display: flex; align-items: center; justify-content: center; color: #909399; font-weight: bold; border-radius: 4px; border: 1px dashed #ccc; }
.result-panel { margin-top: 20px; padding: 15px; background: #fafafa; border-left: 4px solid #409EFF; }
</style>
