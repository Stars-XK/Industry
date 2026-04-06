<template>
  <div class="sys-dict-container">
    <!-- 左侧：字典类型列表 -->
    <div class="dict-type-panel">
      <h3>字典类型 (DictType)</h3>
      <button class="btn-add" @click="handleAddType">新增类型</button>
      <ul class="type-list">
        <li 
          v-for="type in typeList" 
          :key="type.id" 
          :class="{ active: currentType === type.dict_type }"
          @click="handleSelectType(type.dict_type)"
        >
          <span>{{ type.dict_name }} ({{ type.dict_type }})</span>
          <button class="btn-del-small" @click.stop="handleDeleteType(type.id)">删除</button>
        </li>
      </ul>
    </div>

    <!-- 右侧：字典数据列表 -->
    <div class="dict-data-panel">
      <h3>字典数据 (DictData) <span v-if="currentType"> - {{ currentType }}</span></h3>
      <div class="toolbar" v-if="currentType">
        <button class="btn-add" @click="handleAddData">新增字典项</button>
      </div>
      
      <table class="data-table" v-if="currentType">
        <thead>
          <tr>
            <th>字典标签 (Label)</th>
            <th>字典键值 (Value)</th>
            <th>排序</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in dataList" :key="data.id">
            <td>{{ data.dict_label }}</td>
            <td>{{ data.dict_value }}</td>
            <td>{{ data.dict_sort }}</td>
            <td><span class="status-active">正常</span></td>
            <td>
              <button class="btn-del" @click="handleDeleteData(data.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">请在左侧选择一个字典类型以查看详情</div>
      <div v-if="currentType && dataList.length === 0" class="empty">该字典类型下暂无数据项</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const typeList = ref<any[]>([]);
const dataList = ref<any[]>([]);
const currentType = ref<string>('');

const fetchTypeList = async () => {
  try {
    const res = await request.get('/api/system/dict/type/list');
    typeList.value = res;
    if (res.length > 0 && !currentType.value) {
      handleSelectType(res[0].dict_type);
    }
  } catch (error) {
    console.error('获取字典类型失败', error);
  }
};

const fetchDataList = async (type: string) => {
  try {
    const res = await request.get(`/api/system/dict/data/list/${type}`);
    dataList.value = res;
  } catch (error) {
    console.error('获取字典数据失败', error);
  }
};

const handleSelectType = (type: string) => {
  currentType.value = type;
  fetchDataList(type);
};

// --- 类型操作 ---
const handleAddType = async () => {
  const name = prompt('请输入字典名称 (如: 设备类型):');
  const type = prompt('请输入字典标识 (如: sys_device_type):');
  if (name && type) {
    await request.post('/api/system/dict/type/create', { dict_name: name, dict_type: type });
    fetchTypeList();
  }
};

const handleDeleteType = async (id: number) => {
  if (confirm('确认删除该字典类型吗？这将级联删除其下所有字典项！')) {
    await request.delete(`/api/system/dict/type/delete/${id}`);
    currentType.value = '';
    fetchTypeList();
  }
};

// --- 数据操作 ---
const handleAddData = async () => {
  const label = prompt('请输入字典标签 (如: 智能水表):');
  const value = prompt('请输入字典键值 (如: 1):');
  if (label && value) {
    await request.post('/api/system/dict/data/create', { 
      dict_type: currentType.value, 
      dict_label: label, 
      dict_value: value,
      dict_sort: dataList.value.length + 1
    });
    fetchDataList(currentType.value);
  }
};

const handleDeleteData = async (id: number) => {
  if (confirm('确认删除该字典项吗？')) {
    await request.delete(`/api/system/dict/data/delete/${id}`);
    fetchDataList(currentType.value);
  }
};

onMounted(() => {
  fetchTypeList();
});
</script>

<style scoped>
.sys-dict-container {
  display: flex;
  gap: 20px;
  height: 100%;
}
.dict-type-panel {
  width: 300px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.dict-data-panel {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
h3 { margin-top: 0; color: #333; }
.btn-add { padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 15px;}
.type-list { list-style: none; padding: 0; margin: 0; }
.type-list li {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}
.type-list li:hover { background-color: #fafafa; }
.type-list li.active { background-color: #e6f7ff; color: #1890ff; border-right: 3px solid #1890ff; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border: 1px solid #f0f0f0; padding: 10px; text-align: left; }
.data-table th { background-color: #fafafa; }
.status-active { color: green; }
.btn-del { color: #ff4d4f; border: none; background: none; cursor: pointer; }
.btn-del-small { color: #ff4d4f; border: none; background: none; cursor: pointer; font-size: 12px; }
.empty { text-align: center; padding: 40px; color: #999; }
</style>
