<template>
  <div class="page-container sys-dict-container">
    <!-- 左侧：字典类型列表 -->
    <el-card class="dict-type-panel" shadow="never">

      <template #header>
        <div class="card-header">
          <span>字典类型 (DictType)</span>
          <el-button type="primary" size="small" @click="handleAddType">新增</el-button>
        </div>
      </template>
      <ul class="type-list">
        <li 
          v-for="type in typeList" 
          :key="type.id" 
          :class="{ active: currentType === type.dict_type }"
          @click="handleSelectType(type.dict_type)"
        >
          <span class="type-name">{{ type.dict_name }} <br><small class="type-key">{{ type.dict_type }}</small></span>
          <el-button link type="danger" @click.stop="handleDeleteType(type)">删除</el-button>
        </li>
      </ul>
    </el-card>

    <!-- 右侧：字典数据列表 -->
    <el-card class="dict-data-panel" shadow="never">
      <template #header>
        <div class="card-header">
          <span>字典数据 (DictData) <span v-if="currentType"> - {{ currentType }}</span></span>
          <el-button type="primary" size="small" v-if="currentType" @click="handleAddData">新增字典项</el-button>
        </div>
      </template>
      
      <el-table 
        :data="dataList" 
        style="width: 100%" 
        v-if="currentType" 
        v-loading="loadingData"
        element-loading-text="Thinking..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <el-table-column prop="dict_label" label="字典标签 (Label)" />
        <el-table-column prop="dict_value" label="字典键值 (Value)" />
        <el-table-column prop="dict_sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleDeleteData(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="请在左侧选择一个字典类型以查看详情" />
    </el-card>

    <!-- 新增字典类型弹窗 -->
    <el-dialog title="新增字典类型" v-model="typeDialogVisible" width="400px">
      <el-form :model="typeForm" :rules="typeRules" ref="typeFormRef" label-width="100px">
        <el-form-item label="字典名称" prop="dict_name">
          <el-input v-model="typeForm.dict_name" placeholder="请输入字典名称 (如: 设备类型)" />
        </el-form-item>
        <el-form-item label="字典标识" prop="dict_type">
          <el-input v-model="typeForm.dict_type" placeholder="请输入字典标识 (如: sys_device_type)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="typeForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTypeForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增字典数据弹窗 -->
    <el-dialog title="新增字典项" v-model="dataDialogVisible" width="400px">
      <el-form :model="dataForm" :rules="dataRules" ref="dataFormRef" label-width="100px">
        <el-form-item label="字典标签" prop="dict_label">
          <el-input v-model="dataForm.dict_label" placeholder="请输入字典标签 (如: 智能水表)" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dict_value">
          <el-input v-model="dataForm.dict_value" placeholder="请输入字典键值 (如: 1)" />
        </el-form-item>
        <el-form-item label="排序" prop="dict_sort">
          <el-input-number v-model="dataForm.dict_sort" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDataForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const typeList = ref<any[]>([])
const dataList = ref<any[]>([])
const currentType = ref<string>('')
const loadingData = ref(false)

// 字典类型表单
const typeDialogVisible = ref(false)
const typeFormRef = ref()
const typeForm = ref({ dict_name: '', dict_type: '', remark: '' })
const typeRules = {
  dict_name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dict_type: [{ required: true, message: '请输入字典标识', trigger: 'blur' }],
}

// 字典数据表单
const dataDialogVisible = ref(false)
const dataFormRef = ref()
const dataForm = ref({ dict_label: '', dict_value: '', dict_sort: 0 })
const dataRules = {
  dict_label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dict_value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
}

const fetchTypeList = async () => {
  try {
    const res = await request.get('/api/auth/system/dict/type/list')
    typeList.value = res.data || res || []
    if (typeList.value.length > 0 && !currentType.value) {
      handleSelectType(typeList.value[0].dict_type)
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchDataList = async (type: string) => {
  loadingData.value = true
  try {
    const res = await request.get('/api/auth/system/dict/data/list', { params: { dictType: currentType.value } })
    dataList.value = res.data || res || []
  } catch (error) {
    console.error(error)
  } finally {
    loadingData.value = false
  }
}

const handleSelectType = (type: string) => {
  currentType.value = type
  fetchDataList(type)
}

// --- 类型操作 ---
const handleAddType = () => {
  typeForm.value = { dict_name: '', dict_type: '', remark: '' }
  typeDialogVisible.value = true
}

const submitTypeForm = async () => {
  if (!typeFormRef.value) return
  await typeFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (typeForm.value.id) {
        await request.put(`/api/auth/system/dict/type/${typeForm.value.id}`, typeForm.value)
      } else {
        await request.post('/api/auth/system/dict/type', typeForm.value)
      }
      ElMessage.success('保存类型成功')
      typeDialogVisible.value = false
      fetchTypeList()
    }
  })
}

const handleDeleteType = (type: any) => {
  ElMessageBox.confirm(`确认删除字典类型 "${type.dict_name}" 吗？这将级联删除其下所有字典项！`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/auth/system/dict/type/${type.id}`)
    ElMessage.success('删除成功')
    currentType.value = ''
    fetchTypeList()
  }).catch(() => {})
}

// --- 数据操作 ---
const handleAddData = () => {
  dataForm.value = { dict_label: '', dict_value: '', dict_sort: dataList.value.length + 1 }
  dataDialogVisible.value = true
}

const submitDataForm = async () => {
  if (!dataFormRef.value) return
  await dataFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (dataForm.value.id) {
        await request.put(`/api/auth/system/dict/data/${dataForm.value.id}`, dataForm.value)
      } else {
        await request.post('/api/auth/system/dict/data', {
          dict_type: currentType.value,
          ...dataForm.value
        })
      }
      ElMessage.success('保存数据成功')
      dataDialogVisible.value = false
      fetchDataList(currentType.value)
    }
  })
}

const handleDeleteData = (data: any) => {
  ElMessageBox.confirm(`确认删除字典项 "${data.dict_label}" 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    await request.delete(`/api/auth/system/dict/data/${data.id}`)
    ElMessage.success('删除成功')
    fetchDataList(currentType.value)
  }).catch(() => {})
}

onMounted(() => {
  fetchTypeList()
})
</script>

<style scoped>
.page-container {
  height: 100%;
}
.sys-dict-container {
  display: flex;
  gap: 20px;
}
.dict-type-panel {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.dict-data-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.type-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.type-list li {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}
.type-list li:hover {
  background-color: #fafafa;
}
.type-list li.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}
.type-name {
  color: #333;
  font-size: 14px;
}
.type-key {
  color: #999;
  font-size: 12px;
}
</style>
