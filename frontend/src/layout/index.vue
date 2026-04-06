<template>
  <div class="layout-wrapper">
    <!-- 侧边菜单栏 -->
    <aside class="sidebar">
      <div class="logo">信创工业治理</div>
      <nav class="menu-list">
        <ul>
          <!-- 静态渲染菜单树 -->
          <li v-for="menu in staticMenuTree" :key="menu.path || menu.name">
            <div class="menu-item" @click="handleNavigate(menu)">
              {{ menu.name }}
            </div>
            <!-- 二级菜单 -->
            <ul v-if="menu.children && menu.children.length > 0" class="sub-menu">
              <li v-for="child in menu.children" :key="child.path">
                <div class="menu-item sub-item" @click="handleNavigate(child)">
                  {{ child.name }}
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
          <span>欢迎，{{ userStore.userInfo?.username || '本地开发模式' }}</span>
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

const currentPath = ref(route.path);

// 为了方便本地前端开发预览，将原先从后端拉取的动态树改为根据规范写死的静态树
const staticMenuTree = ref([
  { name: '沉浸式数字孪生大屏', path: '/dashboard' },
  {
    name: '综合业务监控台',
    children: [
      { name: '全局态势感知', path: '/scada/overview' },
      { name: '2D拓扑与分区导航', path: '/scada/topology' },
      { name: '工业SCADA工艺组态', path: '/scada/hmi' },
      { name: '安防与环境空间监控', path: '/scada/security' }
    ]
  },
  {
    name: '多维统计与数据分析',
    children: [
      { name: 'DMA产销差与漏损报表', path: '/analytics/nrw' },
      { name: '夜间最小流量分析', path: '/analytics/mnf' },
      { name: '大用户档案与重点企业画像', path: '/analytics/key-account' },
      { name: '营收计费与出账对账管理', path: '/analytics/billing' },
      { name: '综合能效优化与动态成本核算', path: '/analytics/energy' },
      { name: '用量与能耗AI预测分析', path: '/analytics/predict' },
      { name: '在线水力模型仿真与推演', path: '/analytics/hydraulic' }
    ]
  },
  {
    name: '运维治理与协同闭环',
    children: [
      { name: '报警风暴收敛中心', path: '/workflow/alarm' },
      { name: '工单与巡检全生命周期管理', path: '/workflow/work-order' },
      { name: 'AI智能调度与协同指挥', path: '/workflow/aigc' },
      { name: '消息通知与排班调度', path: '/workflow/duty' },
      { name: '应急预案与SOP数字化管理', path: '/workflow/sop' }
    ]
  },
  {
    name: '数据中台与治理底座',
    children: [
      { name: '异构设备与数据源接入', path: '/governance/integration' },
      { name: '营收数据融合与清洗配置', path: '/governance/revenue' },
      { name: '累积量换算与插值容错规则', path: '/governance/interpolate' },
      { name: 'SCADA报警联锁与规则引擎', path: '/governance/interlock' },
      { name: '边缘网关与测点标签管理', path: '/governance/edge-tag' },
      { name: '工业配方管理', path: '/governance/recipe' },
      { name: '数据清洗与传感器健康度', path: '/governance/sensor' }
    ]
  },
  {
    name: '系统设置与台账权限',
    children: [
      { name: '资产与设备台账', path: '/system/asset' },
      { name: '备品备件与仓储管理', path: '/system/inventory' },
      { name: '组织架构与人员管理', path: '/system/org' },
      { name: '角色与权限体系', path: '/system/rbac' },
      { name: '数据字典管理', path: '/system/dict' },
      { name: '安全审计与脱敏日志', path: '/system/audit' },
      { name: '低代码可视化组态工作台', path: '/system/visual-studio' }
    ]
  }
]);

const handleNavigate = (menu: any) => {
  if (menu.path) {
    router.push(menu.path);
    currentPath.value = menu.path;
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
  overflow-y: auto;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #002140;
  flex-shrink: 0;
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
  color: #a6adb4;
}
.sub-item:hover {
  color: white;
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
