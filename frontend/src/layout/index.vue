<template>
  <div class="layout-wrapper">
    <!-- 侧边菜单栏 -->
    <aside class="sidebar">
      <div class="logo">信创工业治理</div>
      <nav class="menu-list">
        <ul>
          <!-- 动态渲染菜单 -->
          <li v-for="menu in menus" :key="menu.id">
            <div class="menu-item" @click="handleNavigate(menu)">
              {{ menu.menu_name }}
            </div>
            <!-- 二级菜单递归（简化版） -->
            <ul v-if="menu.children && menu.children.length > 0" class="sub-menu">
              <li v-for="child in menu.children" :key="child.id">
                <div class="menu-item sub-item" @click="handleNavigate(child)">
                  {{ child.menu_name }}
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main-container">
      <!-- 顶部导航栏 -->
      <header class="navbar">
        <div class="breadcrumb">当前位置：{{ currentPath }}</div>
        <div class="user-info">
          <span>欢迎，{{ userStore.userInfo?.username || '管理员' }}</span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <!-- 核心路由出口 -->
      <section class="app-main">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../store/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const menus = ref<any[]>([]);
const currentPath = ref(route.path);

// 组件挂载时，从后端拉取动态菜单树
onMounted(async () => {
  try {
    const res = await userStore.fetchMenus();
    menus.value = res;
  } catch (error) {
    console.error('拉取菜单失败', error);
  }
});

const handleNavigate = (menu: any) => {
  if (menu.path) {
    // 拼接完整的路径跳转 (例如 /scada/overview)
    let targetPath = menu.path.startsWith('/') ? menu.path : `/${menu.path}`;
    
    // 简单的父子路径拼接逻辑 (如果是子菜单)
    if (menu.parent_id !== 0) {
      const parent = menus.value.find(m => m.id === menu.parent_id);
      if (parent && parent.path) {
        targetPath = `${parent.path}/${menu.path}`.replace('//', '/');
      }
    }
    router.push(targetPath);
    currentPath.value = targetPath;
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background-color: #001529;
  color: white;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #002140;
}
.menu-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.3s;
}
.menu-item:hover {
  background-color: #1890ff;
}
.sub-menu {
  background-color: #000c17;
}
.sub-item {
  padding-left: 40px;
  font-size: 14px;
}

/* 主内容区 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.navbar {
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
.logout-btn {
  margin-left: 15px;
  padding: 5px 10px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.logout-btn:hover {
  background-color: #ff7875;
}
.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
