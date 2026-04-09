<template>
  <div class="app-container fade-in-up">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">备品备件与仓储管理</h1>
        <p class="page-subtitle">Inventory & Spare Parts Lifecycle</p>
      </div>
      <div class="header-actions">
        <el-button  @click="handleCreate" v-hasPermi="['sys:inventory:add']">新增备件</el-button>
      </div>
    </div>
    <div class="box-card" style="margin-bottom: 24px; padding: 16px 20px;">
      <el-form :inline="true" :model="listQuery" class="dark-filter-form">
        <el-form-item label="备件名称">
          <el-input v-model="listQuery.part_name" placeholder="请输入名称" clearable  />
        </el-form-item>
        <el-form-item label="备件分类">
          <el-select v-model="listQuery.category" placeholder="选择分类" clearable  popper-class="glass-dropdown">
            <el-option label="阀门类" value="valve" />
            <el-option label="仪表类" value="meter" />
            <el-option label="化工类" value="chemical" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button  @click="getList">查询库存</el-button>
          <el-button  style="border-color: transparent;" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box-card" style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
      <el-table v-loading="loading" :data="list" style="width: 100%" class="custom-table custom-scrollbar" >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="part_code" label="备件编码" width="150">
          <template #default="{ row }">
            <span class="highlight-text">{{ row.part_code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="part_name" label="备件名称" min-width="180">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-primary); font-weight: 500;">{{ row.part_name }}</span>
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
              <span :style="{ color: row.is_low_stock ? 'var(--el-color-danger)' : 'var(--el-color-success)', fontWeight: '600', fontFamily: 'SF Mono, monospace' }">
                {{ row.stock_quantity }} <span style="font-size: 12px; font-weight: normal;">{{ row.unit }}</span>
              </span>
              <div v-if="row.is_low_stock" style="font-size: 12px; color: var(--el-color-danger); margin-top: 4px;">低于安全库存: {{ row.safe_stock }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="单价(元)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ row.unit_price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="仓库位置" width="150" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns" style="justify-content: center;">
              <el-button class="action-btn text-emerald" link size="small" @click="handleStock(row, 1)">入库</el-button>
              <el-button class="action-btn text-amber" link size="small" @click="handleStock(row, -1)">出库</el-button>
              <el-button class="action-btn text-cyan" link size="small" @click="handleLogs(row)">流水</el-button>
              <el-button class="action-btn" style="color: var(--el-text-color-regular);" link size="small" @click="handleUpdate(row)">编辑</el-button>
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
    <el-dialog :title="dialogStatus === 'create' ? '新增备件' : '编辑备件'" v-model="dialogVisible" width="650px"  :show-close="false">
      <el-form ref="dataFormRef" :model="temp" label-width="100px"  label-position="left">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="备件编码" prop="part_code">
              <el-input v-model="temp.part_code" :disabled="dialogStatus === 'update'"  :class="{ 'is-disabled': dialogStatus === 'update' }" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备件名称" prop="part_name">
              <el-input v-model="temp.part_name"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="temp.category" style="width: 100%"  popper-class="glass-dropdown">
                <el-option label="阀门类" value="valve" />
                <el-option label="仪表类" value="meter" />
                <el-option label="化工类" value="chemical" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="temp.specification"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位">
              <el-input v-model="temp.unit"  />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogStatus === 'create'">
            <el-form-item label="初始库存">
              <el-input-number v-model="temp.stock_quantity" :min="0" style="width: 100%" controls-position="right" class="-number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全预警线">
              <el-input-number v-model="temp.safe_stock" :min="0" style="width: 100%" controls-position="right" class="-number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)">
              <el-input-number v-model="temp.unit_price" :precision="2" :min="0" style="width: 100%" controls-position="right" class="-number" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="仓库位置">
              <el-input v-model="temp.location"  />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" >取消</el-button>
          <el-button  @click="saveData">确认保存</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 库存操作弹窗 -->
    <el-dialog :title="stockAction === 1 ? '备件入库登记' : '备件出库登记'" v-model="stockDialogVisible" width="500px"  :show-close="false">
      <el-form :model="stockTemp" label-width="100px"  label-position="left">
        <el-form-item label="当前备件">
          <el-input :value="currentPart?.part_name" disabled class=" is-disabled" />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentPart?.stock_quantity + ' ' + currentPart?.unit" disabled class=" is-disabled" />
        </el-form-item>
        <el-form-item label="变动数量" required>
          <el-input-number v-model="stockTemp.quantity" :min="0.1" :precision="2" :step="1" style="width: 100%" controls-position="right" class="-number" />
        </el-form-item>
        <el-form-item label="关联工单" v-if="stockAction === -1">
          <el-input v-model="stockTemp.order_id" placeholder="可选: 抢修/维修工单ID"  />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="stockTemp.remark" type="textarea" :rows="3"  />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="stockDialogVisible = false" >取消</el-button>
          <el-button :class="stockAction === 1 ? '' : 'danger-'" @click="saveStock">确认登记</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 流水记录弹窗 -->
    <el-dialog title="出入库流水记录" v-model="logsDialogVisible" width="800px"  :show-close="false">
      <el-table :data="logs" style="width: 100%" height="400" class="custom-table custom-scrollbar">
        <el-table-column prop="created_at" label="发生时间" width="180">
          <template #default="{ row }">
            <span style="color: var(--el-text-color-regular); font-family: 'SF Mono', monospace;">{{ new Date(row.created_at).toLocaleString() }}</span>
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
            <span :style="{ color: row.change_type === 1 ? 'var(--el-color-success)' : 'var(--el-color-danger)', fontWeight: 600, fontFamily: 'SF Mono, monospace' }">
              {{ row.change_type === 1 ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="after_stock" label="结余库存" width="100" align="right">
          <template #default="{ row }">
            <span style="color: var(--el-color-primary); font-weight: 600; font-family: 'SF Mono', monospace;">{{ row.after_stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator_name" label="操作人" width="120" align="center" />
        <el-table-column prop="order_sn" label="关联单号" width="140" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="logsDialogVisible = false" >关闭</el-button>
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
    const res = await request({
      url: '/api/v1/workflow/inventory',
      method: 'get',
      params: listQuery
    })
    const innerData = res.data ? res.data : res
    list.value = innerData.records || []
    total.value = innerData.total || 0
  } catch (e) { /* fallback */ }
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
        url: '/api/v1/workflow/inventory',
        method: 'post',
        data: temp
      })
      ElMessage.success('创建成功')
    } else {
      await request({
        url: `/api/v1/workflow/inventory/${temp.id}`,
        method: 'put',
        data: temp
      })
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) { /* fallback */ }
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该备件?', '提示', { type: 'warning' }).then(async () => {
    await request({
      url: `/api/v1/workflow/inventory/${row.id}`,
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
      url: `/api/v1/workflow/inventory/${currentPart.value.id}/stock`,
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
      url: `/api/v1/workflow/inventory/${row.id}/logs`,
      method: 'get'
    })
    logs.value = data
  } catch (e) { /* fallback */ }
}
onMounted(() => {
  getList()
})
</script>
<style scoped>
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  flex: 1;
  }
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
.highlight-text {
  color: var(--el-color-primary);
  font-family: "SF Mono", monospace;
  font-weight: 600;
}
.action-btns {
  display: flex;
  gap: 12px;
}
.text-cyan { color: var(--el-color-primary); }
.text-emerald { color: var(--el-color-success); }
.text-amber { color: var(--el-color-warning); }
.text-rose { color: var(--el-color-danger); }
.danger-btn {
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-color-danger);
  color: var(--el-color-danger);
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s, opacity 0.3s;
}
.danger-btn:hover {
  background: var(--el-color-danger-light-9);
  box-shadow: 0 0 15px var(--el-color-danger-light-7);
  color: var(--el-text-color-primary);
}
/* Table styles */
/* Dialog Styles */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
/* Form Styles */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
.box-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}
</style>
