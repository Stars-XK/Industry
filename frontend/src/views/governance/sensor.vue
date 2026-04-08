<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>数据清洗与传感器健康度评估</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card header="传感器死值/毛刺过滤规则 (数据中台)" shadow="hover">
            <el-form label-width="150px">
              <el-form-item label="启用毛刺过滤 (Spike)">
                <el-switch v-model="rule.spike_filter" />
                <span style="color: #999; margin-left: 10px;">(剔除单秒跳变 > 200% 的极大值)</span>
              </el-form-item>
              <el-form-item label="最大物理流速上限">
                <el-input-number v-model="rule.max_velocity" :min="1" /> m/s
                <span style="color: #999; margin-left: 10px;">(超过管道最大流速的数据直接抛弃)</span>
              </el-form-item>
              <el-form-item label="死值判定 (Deadband)">
                <el-input-number v-model="rule.dead_time_hours" :min="1" /> 小时内读数绝对不变，则判定为“传感器卡死”
              </el-form-item>
              <el-form-item>
                <el-button type="primary">下发清洗规则</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card header="传感器寿命预警看板" shadow="hover">
            <el-table :data="sensors" border size="small">
              <el-table-column prop="name" label="传感器测点" />
              <el-table-column prop="online" label="本周在线率">
                <template #default="{ row }">
                  <span :style="{ color: row.online < 90 ? 'red' : 'green' }">{{ row.online }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="battery" label="电池剩余电量">
                <template #default="{ row }">
                  <el-progress :percentage="row.battery" :status="row.battery < 20 ? 'exception' : 'success'" />
                </template>
              </el-table-column>
              <el-table-column prop="life" label="预计寿命" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const rule = ref({ spike_filter: true, max_velocity: 5.5, dead_time_hours: 12 })
const sensors = ref([
  { name: 'S-DN300-主干网压力', online: 99.8, battery: 85, life: '3年' },
  { name: 'F-NB-A区电磁水表', online: 92.1, battery: 45, life: '1.5年' },
  { name: 'F-NB-B区地下水表', online: 78.5, battery: 12, life: '即将耗尽' }
])
</script>
<style scoped>.app-container { padding: 20px; }</style>
