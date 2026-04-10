<template>
  <div class="app-container fade-in-up sys-dict-container">
    <!-- 左侧：字典类型列表 -->
    <div class="box-card" style="width: 300px; padding: 0; overflow: hidden; flex: none;">
      <div class="panel-header">
        <span class="panel-title">字典类型 (DictType)</span>
        <el-button type="primary" size="small"  @click="handleAddType">新增</el-button>
          <el-button  @click="showImport = true" icon="Upload">批量导入</el-button>
      </div>
      <ul class="type-list">
        <li
          v-for="type in typeList"
          :key="type.id"
          :class="{ active: currentType === type.dict_type }"
          @click="handleSelectType(type.dict_type)"
        >
          <span class="type-name">{{ type.dict_name }} <br><small class="type-key">{{ type.dict_type }}</small></span>
          <div>
            <el-button link type="primary" @click.stop="handleEditType(type)">编辑</el-button>
            <el-button link type="danger" @click.stop="handleDeleteType(type)">删除</el-button>
          </div>
        </li>
      </ul>
    </div>
    <!-- 右侧：字典数据列表 -->
    <div class="box-card" style="flex: 1; padding: 0; overflow: hidden;">
      <div class="panel-header">
        <span class="panel-title">字典数据 (DictData) <span v-if="currentType" class="highlight-text"> - {{ currentType }}</span></span>
        <el-button type="primary" size="small"  v-if="currentType" @click="handleAddData">新增字典项</el-button>
      </div>
      <el-table
        :data="dataList"
        style="width: 100%"
        class="custom-table"
        v-if="currentType"
        v-loading="loadingData"
        element-loading-text="Thinking…"
        element-loading-spinner="el-icon-loading"
      >
        <el-table-column prop="dict_label" label="字典标签 (Label)"  show-overflow-tooltip  />
        <el-table-column prop="dict_value" label="字典键值 (Value)"  show-overflow-tooltip  />
        <el-table-column prop="dict_sort" label="排序" width="80"  show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'status-dot success' : 'status-dot danger'"></span>
            {{ row.status === 1 ? '正常' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="100">
         <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditData(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteData(row)">删除</el-button>
            </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="请在左侧选择一个字典类型以查看详情" :image-size="100" />
    </div>
    <!-- 字典类型弹窗 -->
    <DictTypeDialog ref="dictTypeDialogRef" @success="fetchTypeList" />
    
    <!-- 字典数据弹窗 -->
    <DictDataDialog ref="dictDataDialogRef" @success="fetchDataList(currentType)" />
  </div>
    <!-- Import Dialog -->
    <ExcelImport
      v-model="showImport"
      title="导入业务字典数据"
      templateName="业务字典"
      :templateColumns="['字典类型', '字典标签', '字典键值', '排序']"
      @import-data="handleImportData"
    />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExcelImport from '@/components/ExcelImport/index.vue'
import DictTypeDialog from './components/DictTypeDialog.vue'
import DictDataDialog from './components/DictDataDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const showImport = ref(false)
const typeList = ref<any[]>([])
const dataList = ref<any[]>([])
const currentType = ref<string>('')
const loadingData = ref(false)

const dictTypeDialogRef = ref()
const dictDataDialogRef = ref()
const fetchTypeList = async () => {
  try {
    const res = await request.get('/api/v1/system/dict/type/list')
    typeList.value = res.data || res || []
    if (typeList.value.length > 0 && !currentType.value) {
      handleSelectType(typeList.value[0].dict_type)
    }
  } catch (e) { /* fallback */ }
}
const fetchDataList = async (type: string) => {
  loadingData.value = true
  try {
    const res = await request.get('/api/v1/system/dict/data/list', { params: { dictType: currentType.value } })
    dataList.value = res.data || res || []
  } catch (e) { /* fallback */ } finally {
    loadingData.value = false
  }
}
const handleSelectType = (type: string) => {
  currentType.value = type
  fetchDataList(type)
}
// --- 类型操作 ---
const handleAddType = () => {
  dictTypeDialogRef.value?.open()
}

// --- 数据操作 ---
const handleEditType = (type: any) => {
  dictTypeDialogRef.value?.open(type)
}

const handleEditData = (data: any) => {
  dictDataDialogRef.value?.open(currentType.value, data)
}

const handleAddData = () => {
  dictDataDialogRef.value?.open(currentType.value, undefined, dataList.value.length + 1)
}

const handleImportData = async (data: any[]) => {
  if (!data || data.length === 0) return
  let successCount = 0
  let failCount = 0
  
  // Try to upload
  for (const item of data) {
    try {
      const payload = {
        dict_type: item['字典类型'],
        dict_label: item['字典标签'],
        dict_value: item['字典键值'],
        dict_sort: item['排序'] || 0
      }
      if (!payload.dict_type || !payload.dict_label || !payload.dict_value) {
        throw new Error('Missing required fields')
      }
      await request.post('/api/v1/system/dict/data', payload)
      successCount++
    } catch (e) {
      failCount++
    }
  }
  
  ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`)
  if (currentType.value) {
    fetchDataList(currentType.value)
  }
}

const handleDeleteType = (type: any) => {
  ElMessageBox.confirm(`确认删除字典类型 "${type.dict_name}" 吗？这将级联删除其下所有字典项！`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/v1/system/dict/type/${type.id}`)
    ElMessage.success('删除成功')
    currentType.value = ''
    fetchTypeList()
  }).catch(() => {})
}

const handleDeleteData = (data: any) => {
  ElMessageBox.confirm(`确认删除字典项 "${data.dict_label}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/v1/system/dict/data/${data.id}`)
    ElMessage.success('删除成功')
    fetchDataList(currentType.value)
  }).catch(() => {})
}
onMounted(() => {
  fetchTypeList()
})
</script>
<style scoped>

.box-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 24px;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.toolbar, .header-actions {
  display: flex;
  gap: 12px;
}
.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}
/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}
.sys-dict-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}
.dict-type-panel {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
.dict-data-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.type-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  width: 100%;
}
.type-list li {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s, opacity 0.3s;
}
.type-list li:hover {
  background: var(--el-fill-color-lighter);
}
.type-list li.active {
  background: var(--el-color-primary-light-9);
  border-right: 3px solid var(--el-color-primary);
}
.type-name {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}
.type-key {
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-family: 'SF Mono', Consolas, monospace;
}
.highlight-text {
  color: var(--el-color-primary);
  font-family: 'SF Mono', Consolas, monospace;
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
