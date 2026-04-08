<template>
  <div class="premium-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">备品备件与仓储管理</h1>
        <p class="page-subtitle">Inventory & Spare Parts Lifecycle</p>
      </div>
      <div class="header-actions">
        <el-button class="neon-btn" @click="handleCreate" v-hasPermi="['sys:inventory:add']">新增备件</el-button>
      </div>
    </div>

    <div class="glass-panel hover-lift" style="margin-bottom: 24px; padding: 16px 20px;">
      <el-form :inline="true" :model="listQuery" class="dark-filter-form">
        <el-form-item label="备件名称">
          <el-input v-model="listQuery.part_name" placeholder="请输入名称" clearable class="glass-input" />
        </el-form-item>
        <el-form-item label="备件分类">
          <el-select v-model="listQuery.category" placeholder="选择分类" clearable class="glass-select" popper-class="glass-dropdown">
            <el-option label="阀门类" value="valve" />
            <el-option label="仪表类" value="meter" />
            <el-option label="化工类" value="chemical" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="glass-btn" @click="getList">查询库存</el-button>
          <el-button class="glass-btn" style="border-color: transparent;" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="glass-panel hover-lift" style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
      <el-table v-loading="loading" :data="list" style="width: 100%" class="dark-table custom-scrollbar" element-loading-background="rgba(15,23,42,0.8)">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="part_code" label="备件编码" width="150">
          <template #default="{ row }">
            <span class="highlight-text">{{ row.part_code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="part_name" label="备件名称" min-width="180">
          <template #default="{ row }">
            <span style="color: #e2e8f0; font-weight: 500;">{{ row.part_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category === 'valve'" effect="dark" class="dark-tag">阀门类</el-tag>
            <el-tag v-else-if="row.category === 'meter'" effect="dark" class="success-tag">仪表类</el-tag>
            <el-tag v-else-if="row.category === 'chemical'" effect="dark" class="warning-tag">化工类</el-tag>
            <el-tag v-else effect="dark" class="dark-tag">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格型号" width="150" />
        <el-table-column label="库存情况" align="center" width="160">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span :style="{ color: row.is_low_stock ? '#f43f5e' : '#10b981', fontWeight: '600', fontFamily: 'SF Mono, monospace' }">
                {{ row.stock_quantity }} <span style="font-size: 12px; font-weight: normal;">{{ row.unit }}</span>
              </span>
              <div v-if="row.is_low_stock" style="font-size: 12px; color: #f43f5e; margin-top: 4px;">低于安全库存: {{ row.safe_stock }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="单价(元)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ row.unit_price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="仓库位置" width="150" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns" style="justify-content: center;">
              <el-button class="action-btn text-emerald" link size="small" @click="handleStock(row, 1)">入库</el-button>
              <el-button class="action-btn text-amber" link size="small" @click="handleStock(row, -1)">出库</el-button>
              <el-button class="action-btn text-cyan" link size="small" @click="handleLogs(row)">流水</el-button>
              <el-button class="action-btn" style="color: #94a3b8;" link size="small" @click="handleUpdate(row)">编辑</el-button>
              <el-button class="action-btn text-rose" link size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.limit"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
          class="dark-pagination"
        />
      </div>
    </div>

    <!-- 备件编辑弹窗 -->
    <el-dialog :title="dialogStatus === 'create' ? '新增备件' : '编辑备件'" v-model="dialogVisible" width="650px" class="glass-dialog" :show-close="false">
      <el-form ref="dataFormRef" :model="temp" label-width="100px" class="dark-form" label-position="left">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="备件编码" prop="part_code">
              <el-input v-model="temp.part_code" :disabled="dialogStatus === 'update'" class="glass-input" :class="{ 'is-disabled': dialogStatus === 'update' }" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备件名称" prop="part_name">
              <el-input v-model="temp.part_name" class="glass-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="temp.category" style="width: 100%" class="glass-select" popper-class="glass-dropdown">
                <el-option label="阀门类" value="valve" />
                <el-option label="仪表类" value="meter" />
                <el-option label="化工类" value="chemical" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="temp.specification" class="glass-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位">
              <el-input v-model="temp.unit" class="glass-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogStatus === 'create'">
            <el-form-item label="初始库存">
              <el-input-number v-model="temp.stock_quantity" :min="0" style="width: 100%" controls-position="right" class="glass-input-number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全预警线">
              <el-input-number v-model="temp.safe_stock" :min="0" style="width: 100%" controls-position="right" class="glass-input-number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)">
              <el-input-number v-model="temp.unit_price" :precision="2" :min="0" style="width: 100%" controls-position="right" class="glass-input-number" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="仓库位置">
              <el-input v-model="temp.location" class="glass-input" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="glass-btn">取消</el-button>
          <el-button class="neon-btn" @click="saveData">确认保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 库存操作弹窗 -->
    <el-dialog :title="stockAction === 1 ? '备件入库登记' : '备件出库登记'" v-model="stockDialogVisible" width="500px" class="glass-dialog" :show-close="false">
      <el-form :model="stockTemp" label-width="100px" class="dark-form" label-position="left">
        <el-form-item label="当前备件">
          <el-input :value="currentPart?.part_name" disabled class="glass-input is-disabled" />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentPart?.stock_quantity + ' ' + currentPart?.unit" disabled class="glass-input is-disabled" />
        </el-form-item>
        <el-form-item label="变动数量" required>
          <el-input-number v-model="stockTemp.quantity" :min="0.1" :precision="2" :step="1" style="width: 100%" controls-position="right" class="glass-input-number" />
        </el-form-item>
        <el-form-item label="关联工单" v-if="stockAction === -1">
          <el-input v-model="stockTemp.order_id" placeholder="可选: 抢修/维修工单ID" class="glass-input" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="stockTemp.remark" type="textarea" :rows="3" class="glass-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="stockDialogVisible = false" class="glass-btn">取消</el-button>
          <el-button :class="stockAction === 1 ? 'neon-btn' : 'danger-neon-btn'" @click="saveStock">确认登记</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 流水记录弹窗 -->
    <el-dialog title="出入库流水记录" v-model="logsDialogVisible" width="800px" class="glass-dialog" :show-close="false">
      <el-table :data="logs" style="width: 100%" height="400" class="dark-table custom-scrollbar">
        <el-table-column prop="created_at" label="发生时间" width="180">
          <template #default="{ row }">
            <span style="color: #94a3b8; font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.change_type === 1" effect="dark" class="success-tag" style="border: none;">入库</el-tag>
            <el-tag v-else-if="row.change_type === -1" effect="dark" class="danger-tag" style="border: none;">出库</el-tag>
            <el-tag v-else effect="dark" class="dark-tag" style="border: none;">盘点</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="变动数量" width="100" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.change_type === 1 ? '#10b981' : '#f43f5e', fontWeight: 600, fontFamily: 'SF Mono, monospace' }">
              {{ row.change_type === 1 ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="after_stock" label="结余库存" width="100" align="right">
          <template #default="{ row }">
            <span style="color: #00d8ff; font-weight: 600; font-family: 'SF Mono', monospace;">{{ row.after_stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator_name" label="操作人" width="120" align="center" />
        <el-table-column prop="order_sn" label="关联单号" width="140" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="logsDialogVisible = false" class="glass-btn">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const listQuery = reactive({
  page: 1,
  limit: 10,
  part_name: '',
  category: ''
})

const dialogVisible = ref(false)
const dialogStatus = ref('create')
const temp = reactive({
  id: undefined,
  part_name: '',
  part_code: '',
  category: '',
  specification: '',
  unit: '个',
  stock_quantity: 0,
  safe_stock: 5,
  unit_price: 0,
  location: '',
  status: 1
})

const stockDialogVisible = ref(false)
const stockAction = ref(1)
const currentPart = ref<any>(null)
const stockTemp = reactive({
  quantity: 1,
  order_id: '',
  remark: ''
})

const logsDialogVisible = ref(false)
const logs = ref([])

const getList = async () => {
  loading.value = true
  try {
    const { data } = await request({
      url: '/api/workflow/inventory',
      method: 'get',
      params: listQuery
    })
    list.value = data.records
    total.value = data.total
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const resetQuery = () => {
  listQuery.part_name = ''
  listQuery.category = ''
  getList()
}

const handleCreate = () => {
  dialogStatus.value = 'create'
  Object.assign(temp, {
    id: undefined,
    part_name: '',
    part_code: 'P-' + Date.now(),
    category: 'other',
    specification: '',
    unit: '个',
    stock_quantity: 0,
    safe_stock: 5,
    unit_price: 0,
    location: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleUpdate = (row: any) => {
  dialogStatus.value = 'update'
  Object.assign(temp, row)
  dialogVisible.value = true
}

const saveData = async () => {
  try {
    if (dialogStatus.value === 'create') {
      await request({
        url: '/api/workflow/inventory',
        method: 'post',
        data: temp
      })
      ElMessage.success('创建成功')
    } else {
      await request({
        url: `/api/workflow/inventory/${temp.id}`,
        method: 'put',
        data: temp
      })
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该备件?', '提示', { type: 'warning' }).then(async () => {
    await request({
      url: `/api/workflow/inventory/${row.id}`,
      method: 'delete'
    })
    ElMessage.success('删除成功')
    getList()
  })
}

const handleStock = (row: any, action: number) => {
  stockAction.value = action
  currentPart.value = row
  stockTemp.quantity = 1
  stockTemp.order_id = ''
  stockTemp.remark = action === 1 ? '手动入库' : '领料出库'
  stockDialogVisible.value = true
}

const saveStock = async () => {
  try {
    await request({
      url: `/api/workflow/inventory/${currentPart.value.id}/stock`,
      method: 'post',
      data: {
        change_type: stockAction.value,
        quantity: stockTemp.quantity,
        order_id: stockTemp.order_id || null,
        remark: stockTemp.remark
      }
    })
    ElMessage.success('操作成功')
    stockDialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleLogs = async (row: any) => {
  logsDialogVisible.value = true
  try {
    const { data } = await request({
      url: `/api/workflow/inventory/${row.id}/logs`,
      method: 'get'
    })
    logs.value = data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}
.highlight-text {
  color: #00d8ff;
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.dark-tag {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #cbd5e1;
}
.danger-tag {
  background-color: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
}
.warning-tag {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}
.success-tag {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
.action-btns {
  display: flex;
  gap: 12px;
}
.action-btn {
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover {
  text-shadow: 0 0 8px currentColor;
  transform: translateY(-1px);
}
.text-cyan { color: #00d8ff; }
.text-emerald { color: #10b981; }
.text-amber { color: #f59e0b; }
.text-rose { color: #f43f5e; }
.danger-neon-btn {
  background: transparent;
  border: 1px solid #f43f5e;
  color: #f43f5e;
  transition: all 0.3s;
}
.danger-neon-btn:hover {
  background: rgba(244, 63, 94, 0.1);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  color: #fff;
}
/* Table styles */
:deep(.el-table th.el-table__cell) {
  background-color: var(--el-table-header-bg-color) !important;
  border-bottom: 1px solid var(--el-table-border-color);
}
:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-table-border-color); }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: var(--el-table-row-hover-bg-color) !important; }
:deep(.el-table::before) { display: none; }
.custom-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.custom-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.2);
}
/* Dialog Styles */
:deep(.glass-dialog) {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
:deep(.dark-filter-form .el-form-item) {
  margin-bottom: 0;
}
:deep(.dark-form .el-form-item__label),
:deep(.dark-filter-form .el-form-item__label) {
  color: #94a3b8;
  font-weight: 500;
}
:deep(.glass-input .el-input__wrapper),
:deep(.glass-input-number .el-input__wrapper),
:deep(.glass-input .el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: #e2e8f0;
}
:deep(.glass-input.is-disabled .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: none;
}
:deep(.glass-input .el-input__wrapper:hover:not(.is-disabled)),
:deep(.glass-input-number .el-input__wrapper:hover),
:deep(.glass-input .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(0, 216, 255, 0.3) inset;
}
:deep(.glass-input .el-input__wrapper.is-focus),
:deep(.glass-input-number .el-input__wrapper.is-focus),
:deep(.glass-input .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #00d8ff inset !important;
}
:deep(.glass-select .el-input__wrapper) {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
:deep(.glass-select .el-input__inner),
:deep(.glass-input .el-input__inner),
:deep(.glass-input-number .el-input__inner) {
  color: #e2e8f0;
}
:deep(.glass-input.is-disabled .el-input__inner) {
  color: #94a3b8;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #e2e8f0 !important;
}
:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  color: #00d8ff !important;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
:deep(.dark-pagination .el-pagination__total),
:deep(.dark-pagination .el-pagination__jump) {
  color: #94a3b8;
}
:deep(.dark-pagination button),
:deep(.dark-pagination .el-pager li) {
  background-color: transparent !important;
  color: #94a3b8;
}
:deep(.dark-pagination .el-pager li.is-active) {
  color: #00d8ff;
  font-weight: bold;
}
</style>
