<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>资产与设备台账全生命周期管理</span>
      </div>
      <el-form inline>
        <el-form-item label="设备编码"><el-input placeholder="SN / 资产号" /></el-form-item>
        <el-form-item label="设备类型">
          <el-select placeholder="水表 / 阀门 / 泵">
            <el-option label="智能水表" value="1" />
            <el-option label="调节阀门" value="2" />
            <el-option label="水泵" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary">搜索台账</el-button></el-form-item>
        <el-form-item><el-button type="warning" @click="dialogVisible = true">高危：换表/拆表录入</el-button></el-form-item>
      </el-form>

      <el-table :data="assets" border style="margin-top: 20px">
        <el-table-column prop="code" label="设备编码" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="install_date" label="安装日期" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warranty" label="保修期至" />
        <el-table-column label="3D模型绑定" align="center">
          <template #default="{ row }">
            <el-button type="primary" link><el-icon><View /></el-icon> 孪生挂载点</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="换表接续防负流录入单" v-model="dialogVisible" width="500px">
        <el-alert title="系统将自动接续新老表底码，防止产销差计算出现巨大负值" type="error" show-icon style="margin-bottom: 20px;" />
        <el-form label-width="120px">
          <el-form-item label="旧表编号"><el-input value="M-0021 (故障拆除)" disabled /></el-form-item>
          <el-form-item label="旧表拆除止码"><el-input-number :min="0" :precision="2" style="width: 100%" /></el-form-item>
          <el-form-item label="新表编号"><el-input placeholder="扫码录入新表 SN" /></el-form-item>
          <el-form-item label="新表安装起码"><el-input-number :min="0" :precision="2" style="width: 100%" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary">确认换表接续</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { View } from '@element-plus/icons-vue'
const dialogVisible = ref(false)
const assets = ref([
  { code: 'M-DN100-01', name: '一厂区总出水表', type: '智能水表', install_date: '2023-01-15', status: '在线', warranty: '2028-01-15' },
  { code: 'V-REG-02', name: '高位水池进水调节阀', type: '阀门', install_date: '2022-05-20', status: '在线', warranty: '2025-05-20' },
  { code: 'P-MAIN-01', name: '1号变频离心泵', type: '水泵', install_date: '2021-11-11', status: '维修中', warranty: '2024-11-11' }
])
</script>
<style scoped>.app-container { padding: 20px; }</style>
