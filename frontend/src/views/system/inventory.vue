<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="备件名称">
          <el-input v-model="listQuery.part_name" placeholder="请输入备件名称" clearable />
        </el-form-item>
        <el-form-item label="备件分类">
          <el-select v-model="listQuery.category" placeholder="选择分类" clearable>
            <el-option label="阀门类" value="valve" />
            <el-option label="仪表类" value="meter" />
            <el-option label="化工类" value="chemical" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="success" @click="handleCreate" v-hasPermi="['sys:inventory:add']">新增备件</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px;">
      <el-table v-loading="loading" :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="part_code" label="备件编码" width="150" />
        <el-table-column prop="part_name" label="备件名称" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.category === 'valve'">阀门类</el-tag>
            <el-tag v-else-if="row.category === 'meter'" type="success">仪表类</el-tag>
            <el-tag v-else-if="row.category === 'chemical'" type="warning">化工类</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格型号" />
        <el-table-column label="库存情况" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.is_low_stock ? 'red' : 'green', fontWeight: 'bold' }">
              {{ row.stock_quantity }} {{ row.unit }}
            </span>
            <div v-if="row.is_low_stock" style="font-size: 12px; color: red;">(低于安全库存: {{ row.safe_stock }})</div>
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="单价(元)" width="100" />
        <el-table-column prop="location" label="仓库位置" />
        <el-table-column label="操作" width="250" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleStock(row, 1)">入库</el-button>
            <el-button type="warning" link @click="handleStock(row, -1)">出库</el-button>
            <el-button type="info" link @click="handleLogs(row)">流水</el-button>
            <el-button type="primary" link @click="handleUpdate(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
        />
      </div>
    </el-card>

    <!-- 备件编辑弹窗 -->
    <el-dialog :title="dialogStatus === 'create' ? '新增备件' : '编辑备件'" v-model="dialogVisible" width="600px">
      <el-form ref="dataFormRef" :model="temp" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备件编码" prop="part_code">
              <el-input v-model="temp.part_code" :disabled="dialogStatus === 'update'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备件名称" prop="part_name">
              <el-input v-model="temp.part_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="temp.category" style="width: 100%">
                <el-option label="阀门类" value="valve" />
                <el-option label="仪表类" value="meter" />
                <el-option label="化工类" value="chemical" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="temp.specification" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位">
              <el-input v-model="temp.unit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="初始库存" v-if="dialogStatus === 'create'">
              <el-input-number v-model="temp.stock_quantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全预警线">
              <el-input-number v-model="temp.safe_stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)">
              <el-input-number v-model="temp.unit_price" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="仓库位置">
              <el-input v-model="temp.location" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData">确认</el-button>
      </template>
    </el-dialog>

    <!-- 库存操作弹窗 -->
    <el-dialog :title="stockAction === 1 ? '备件入库' : '备件出库'" v-model="stockDialogVisible" width="500px">
      <el-form :model="stockTemp" label-width="100px">
        <el-form-item label="当前备件">
          <el-input :value="currentPart?.part_name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentPart?.stock_quantity + ' ' + currentPart?.unit" disabled />
        </el-form-item>
        <el-form-item label="变动数量" required>
          <el-input-number v-model="stockTemp.quantity" :min="0.1" :precision="2" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="关联工单" v-if="stockAction === -1">
          <el-input v-model="stockTemp.order_id" placeholder="可选: 抢修/维修工单ID" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="stockTemp.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStock">确认</el-button>
      </template>
    </el-dialog>

    <!-- 流水记录弹窗 -->
    <el-dialog title="出入库流水记录" v-model="logsDialogVisible" width="800px">
      <el-table :data="logs" border height="400">
        <el-table-column prop="created_at" label="时间" width="160">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.change_type === 1" type="success">入库</el-tag>
            <el-tag v-else-if="row.change_type === -1" type="danger">出库</el-tag>
            <el-tag v-else type="info">盘点修正</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="变动数量" width="100" />
        <el-table-column prop="after_stock" label="变动后库存" width="100" />
        <el-table-column prop="operator_name" label="操作人" width="100" />
        <el-table-column prop="order_sn" label="关联工单号" width="120" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
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
const currentPart = ref(null)
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
.app-container {
  padding: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
