<template>
  <div class="sys-menu-container">
    <h2>菜单与权限配置</h2>
    <div class="toolbar">
      <button @click="fetchMenuTree">刷新树</button>
      <button @click="handleAddRoot">新增根菜单</button>
    </div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>菜单名称</th>
          <th>类型</th>
          <th>路由路径</th>
          <th>组件路径</th>
          <th>权限标识</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="menu in menuTree" :key="menu.id">
          <!-- 一级菜单 -->
          <tr class="level-1">
            <td><strong>{{ menu.menu_name }}</strong></td>
            <td>{{ formatType(menu.menu_type) }}</td>
            <td>{{ menu.path || '-' }}</td>
            <td>{{ menu.component || '-' }}</td>
            <td>{{ menu.perm_code || '-' }}</td>
            <td>
              <button class="btn-add" @click="handleAddChild(menu.id)">添加子项</button>
              <button class="btn-del" @click="handleDelete(menu.id)">删除</button>
            </td>
          </tr>
          <!-- 二级菜单展开显示 (简易实现) -->
          <tr v-for="child in menu.children" :key="child.id" class="level-2">
            <td style="padding-left: 30px;">├─ {{ child.menu_name }}</td>
            <td>{{ formatType(child.menu_type) }}</td>
            <td>{{ child.path || '-' }}</td>
            <td>{{ child.component || '-' }}</td>
            <td>{{ child.perm_code || '-' }}</td>
            <td>
              <button class="btn-del" @click="handleDelete(child.id)">删除</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <div v-if="menuTree.length === 0" class="empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const menuTree = ref<any[]>([]);

const fetchMenuTree = async () => {
  try {
    const res = await request.get('/api/system/menu/tree');
    menuTree.value = res;
  } catch (error) {
    console.error('获取菜单树失败', error);
  }
};

const formatType = (type: string) => {
  if (type === 'M') return '目录';
  if (type === 'C') return '菜单';
  if (type === 'F') return '按钮';
  return type;
};

const handleAddRoot = async () => {
  const name = prompt('请输入新的一级菜单名称:');
  if (name) {
    await request.post('/api/system/menu/create', { menu_name: name, parent_id: 0, menu_type: 'M' });
    fetchMenuTree();
  }
};

const handleAddChild = async (parentId: number) => {
  const name = prompt('请输入子菜单名称:');
  const path = prompt('请输入路由路径 (如 dashboard):');
  if (name) {
    await request.post('/api/system/menu/create', { menu_name: name, path, parent_id: parentId, menu_type: 'C' });
    fetchMenuTree();
  }
};

const handleDelete = async (id: number) => {
  if (confirm('确认删除该菜单吗？（若有子菜单将不允许删除）')) {
    try {
      await request.delete(`/api/system/menu/delete/${id}`);
      fetchMenuTree();
    } catch (e: any) {
      alert(e.message || '删除失败');
    }
  }
};

onMounted(() => {
  fetchMenuTree();
});
</script>

<style scoped>
.sys-menu-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
.toolbar { margin-bottom: 15px; }
.toolbar button { margin-right: 10px; padding: 6px 12px; cursor: pointer; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border: 1px solid #f0f0f0; padding: 10px; text-align: left; }
.data-table th { background-color: #fafafa; }
.level-1 { background-color: #f9f9f9; }
.btn-add { color: #52c41a; border: none; background: none; cursor: pointer; margin-right: 8px; }
.btn-del { color: #ff4d4f; border: none; background: none; cursor: pointer; }
.empty { text-align: center; padding: 20px; color: #999; }
</style>
