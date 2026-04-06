<template>
  <div class="sys-user-container">
    <h2>用户管理</h2>
    <div class="toolbar">
      <button @click="fetchUsers">刷新数据</button>
      <button @click="handleAdd">新增用户</button>
    </div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>登录名</th>
          <th>手机号</th>
          <th>部门ID</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userList" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.phone || '-' }}</td>
          <td>{{ user.dept_id }}</td>
          <td>
            <span :class="user.status === 1 ? 'status-active' : 'status-disabled'">
              {{ user.status === 1 ? '正常' : '禁用' }}
            </span>
          </td>
          <td>{{ new Date(user.created_at).toLocaleString() }}</td>
          <td>
            <button class="btn-edit" @click="handleEdit(user)">编辑</button>
            <button class="btn-del" @click="handleDelete(user.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="userList.length === 0" class="empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const userList = ref<any[]>([]);

const fetchUsers = async () => {
  try {
    const res = await request.get('/api/system/user/list?page=1&size=50');
    userList.value = res.list;
  } catch (error) {
    console.error('获取用户列表失败', error);
  }
};

const handleAdd = () => {
  alert('新增用户面板 (待接入UI组件库如 Element Plus)');
};

const handleEdit = (user: any) => {
  alert(`编辑用户: ${user.username}`);
};

const handleDelete = async (id: number) => {
  if (confirm('确认删除该用户吗？')) {
    await request.delete(`/api/system/user/delete/${id}`);
    fetchUsers();
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.sys-user-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
.toolbar {
  margin-bottom: 15px;
}
.toolbar button {
  margin-right: 10px;
  padding: 6px 12px;
  cursor: pointer;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  border: 1px solid #f0f0f0;
  padding: 10px;
  text-align: left;
}
.data-table th {
  background-color: #fafafa;
}
.status-active { color: green; }
.status-disabled { color: red; }
.btn-edit { color: #1890ff; border: none; background: none; cursor: pointer; margin-right: 8px; }
.btn-del { color: #ff4d4f; border: none; background: none; cursor: pointer; }
.empty { text-align: center; padding: 20px; color: #999; }
</style>
