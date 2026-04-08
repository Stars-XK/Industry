<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="500px"
    class="industrial-dialog"
    destroy-on-close
  >
    <div class="import-container">
      <div class="import-tips">
        <el-icon class="tip-icon"><InfoFilled /></el-icon>
        <span>请先下载标准模板，按要求填写后上传。支持 .xlsx, .xls 格式。</span>
      </div>
      
      <div class="template-download">
        <el-button type="primary" link @click="downloadTemplate">
          <el-icon><Download /></el-icon> 下载 {{ templateName }} 模板
        </el-button>
      </div>

      <el-upload
        class="excel-uploader"
        drag
        :action="uploadUrl"
        :headers="headers"
        :auto-upload="false"
        :on-change="handleChange"
        :file-list="fileList"
        accept=".xlsx,.xls"
        :limit="1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
      </el-upload>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false" class="glass-btn">取消</el-button>
        <el-button class="neon-btn" @click="submitUpload" :loading="loading">开始导入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, Download, UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '批量导入' },
  templateName: { type: String, default: '数据' },
  uploadUrl: { type: String, default: '#' },
  templateColumns: { type: Array, default: () => [] } // e.g. ['部门名称', '部门编码']
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const fileList = ref<any[]>([])

const headers = computed(() => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  }
})

const handleChange = (file: any, files: any[]) => {
  fileList.value = files.slice(-1) // Keep only the latest file
}

const downloadTemplate = () => {
  // Simple CSV generation for the template
  const bom = '\uFEFF'
  const csvContent = props.templateColumns.join(',') + '\n'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${props.templateName}导入模板.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要导入的文件！')
    return
  }
  
  loading.value = true
  
  // Since we don't have real backend endpoints for all imports right now,
  // we simulate a successful upload for UX demonstration.
  setTimeout(() => {
    loading.value = false
    ElMessage.success(`${props.templateName}数据导入成功 (模拟)！`)
    visible.value = false
    fileList.value = []
    emit('success')
  }, 1500)
}
</script>

<style scoped>
.import-container {
  padding: 10px 20px;
}

.import-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 216, 255, 0.1);
  border: 1px solid rgba(0, 216, 255, 0.2);
  border-radius: 8px;
  color: #00d8ff;
  font-size: 13px;
  margin-bottom: 16px;
}

.template-download {
  margin-bottom: 20px;
  text-align: right;
}

.excel-uploader {
  width: 100%;
}
:deep(.el-upload-dragger) {
  background-color: rgba(2, 6, 23, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
:deep(.el-upload-dragger:hover) {
  border-color: #00d8ff !important;
}
:deep(.el-upload__text) {
  color: #94a3b8;
}
:deep(.el-upload__text em) {
  color: #00d8ff;
}
</style>
