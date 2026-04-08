<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>安防与环境空间监控</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="video-matrix">
            <div class="video-cell" v-for="i in 4" :key="i">
              <div class="video-title">监控点位 {{ i }} - 1号泵房</div>
              <div class="video-placeholder">视频流 RTSP 接入区</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" header="环境指标实时数据">
            <el-form label-width="120px">
              <el-form-item label="硫化氢 (H2S)">
                <el-tag type="success">0.02 ppm</el-tag>
              </el-form-item>
              <el-form-item label="一氧化碳 (CO)">
                <el-tag type="success">1.5 ppm</el-tag>
              </el-form-item>
              <el-form-item label="温度">
                <el-tag type="info">26.5 °C</el-tag>
              </el-form-item>
              <el-form-item label="门禁状态">
                <el-tag type="success">正常锁定</el-tag>
                <el-button type="danger" size="small" style="margin-left: 10px;">紧急锁定</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
.app-container { padding: 20px; }
.video-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.video-cell { border: 1px solid #ccc; height: 250px; position: relative; background: #000; }
.video-title { position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; padding: 5px; font-size: 12px; }
.video-placeholder { color: #666; display: flex; justify-content: center; align-items: center; height: 100%; }
</style>
