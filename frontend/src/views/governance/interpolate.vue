<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>累积量换算与插值容错规则配置</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-table :data="rules" border stripe>
            <el-table-column prop="rule_name" label="设备类型/场景" />
            <el-table-column prop="interp_method" label="插值补偿算法">
              <template #default="{ row }">
                <el-select v-model="row.interp_method" size="small">
                  <el-option label="PCHIP (三次埃尔米特)" value="pchip" />
                  <el-option label="Linear (线性插值)" value="linear" />
                  <el-option label="Prev (前值填补)" value="prev" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="max_gap_hours" label="允许最大断点时长(小时)">
              <template #default="{ row }">
                <el-input-number v-model="row.max_gap_hours" size="small" :min="1" />
              </template>
            </el-table-column>
            <el-table-column prop="is_negative_allow" label="允许负流量倒转">
              <template #default="{ row }">
                <el-switch v-model="row.is_negative_allow" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link>保存策略</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const rules = ref([
  { rule_name: '主干管超声波流量计', interp_method: 'pchip', max_gap_hours: 4, is_negative_allow: false },
  { rule_name: '小区电磁水表', interp_method: 'linear', max_gap_hours: 12, is_negative_allow: true },
  { rule_name: '管网压力计', interp_method: 'prev', max_gap_hours: 1, is_negative_allow: false }
])
</script>
<style scoped>.app-container { padding: 20px; }</style>
