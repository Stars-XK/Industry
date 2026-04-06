<template>
  <div class="layout-wrapper">
    <!-- 全局底层地图占位 (模拟 3D/2D GIS 地图层) -->
    <div class="global-map-bg">
      <div class="map-grid-overlay"></div>
      <div class="map-text-watermark">底座 GIS/BIM 地图层</div>
    </div>

    <!-- 侧边菜单栏 (窄边图标模式) -->
    <aside class="sidebar-icon-mode">
      <div class="logo">
        <span class="logo-icon">智</span>
      </div>
      <nav class="menu-list">
        <ul>
          <!-- 静态渲染菜单树 -->
          <li 
            v-for="(menu, index) in staticMenuTree" 
            :key="menu.path || menu.name"
            class="menu-item-wrapper"
            @mouseenter="hoverMenu = index"
            @mouseleave="hoverMenu = null"
          >
            <!-- 图标区 -->
            <div class="menu-icon-box" :class="{ active: isMenuActive(menu) }" @click="handleNavigate(menu)">
              <div v-html="menu.icon" class="svg-icon"></div>
            </div>
            
            <!-- 悬浮子菜单面板 (如果存在子菜单) -->
            <div class="popover-menu" v-show="hoverMenu === index && menu.children && menu.children.length > 0">
              <div class="popover-title">{{ menu.name }}</div>
              <ul class="popover-list">
                <li 
                  v-for="child in menu.children" 
                  :key="child.path"
                  class="sub-item"
                  :class="{ 'sub-active': currentPath === child.path }"
                  @click="handleNavigate(child)"
                >
                  {{ child.name }}
                </li>
              </ul>
            </div>

            <!-- 悬浮 Tooltip (如果没有子菜单) -->
            <div class="tooltip" v-show="hoverMenu === index && (!menu.children || menu.children.length === 0)">
              {{ menu.name }}
            </div>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main-container">
      <!-- 顶部导航栏 (半透明，不完全遮挡地图) -->
      <header class="navbar glass-effect">
        <div class="breadcrumb">当前位置：{{ currentPath }}</div>
        <div class="user-info">
          <span>欢迎，{{ userStore.userInfo?.username || '本地开发模式' }}</span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <!-- 核心路由出口 (完全透明，由内部组件决定自己的面板大小和位置) -->
      <section class="app-main">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../store/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const currentPath = ref(route.path);
const hoverMenu = ref<number | null>(null);

// 监听路由变化，更新面包屑
watch(() => route.path, (newPath) => {
  currentPath.value = newPath;
});

// SVG 图标集合 (使用基础的占位 SVG 以保持零依赖)
const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  scada: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  analytics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  workflow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><polyline points="9 14 12 17 18 10"></polyline></svg>`,
  governance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
  system: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
};

const staticMenuTree = ref([
  { name: '沉浸式数字孪生大屏', path: '/dashboard', icon: icons.dashboard },
  {
    name: '综合业务监控台',
    icon: icons.scada,
    children: [
      { name: '全局态势感知', path: '/scada/overview' },
      { name: '2D拓扑与分区导航', path: '/scada/topology' },
      { name: '工业SCADA工艺组态', path: '/scada/hmi' },
      { name: '安防与环境空间监控', path: '/scada/security' }
    ]
  },
  {
    name: '多维统计与数据分析',
    icon: icons.analytics,
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
    icon: icons.workflow,
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
    icon: icons.governance,
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
    icon: icons.system,
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

// 判断当前菜单是否高亮
const isMenuActive = (menu: any) => {
  if (menu.path === currentPath.value) return true;
  if (menu.children && menu.children.some((child: any) => child.path === currentPath.value)) {
    return true;
  }
  return false;
};

const handleNavigate = (menu: any) => {
  if (menu.path) {
    router.push(menu.path);
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.layout-wrapper {
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #0b1426; /* 深色科技感底色 */
}

/* 全局底层地图层 */
.global-map-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: radial-gradient(circle at center, #10213d 0%, #060b14 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-grid-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(rgba(24, 144, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24, 144, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
.map-text-watermark {
  color: rgba(24, 144, 255, 0.2);
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 10px;
  pointer-events: none;
  user-select: none;
}

/* 侧边栏 (图标模式) */
.sidebar-icon-mode {
  position: relative;
  z-index: 10;
  width: 64px;
  background-color: rgba(0, 21, 41, 0.85); /* 半透明背景 */
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(24, 144, 255, 0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.logo-icon {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}
.menu-list {
  flex: 1;
  padding-top: 15px;
}
.menu-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu-item-wrapper {
  position: relative;
  margin-bottom: 10px;
}
.menu-icon-box {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a6adb4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.menu-icon-box:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}
.menu-icon-box.active {
  background-color: #1890ff;
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.5);
}
.svg-icon {
  width: 22px;
  height: 22px;
}

/* 悬浮面板 */
.popover-menu {
  position: absolute;
  left: 70px;
  top: 0;
  width: 200px;
  background-color: rgba(0, 21, 41, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.6);
  padding: 8px 0;
  z-index: 100;
}
.popover-menu::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 15px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent rgba(0, 21, 41, 0.95) transparent transparent;
}
.popover-title {
  padding: 8px 16px;
  font-size: 13px;
  color: #a6adb4;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 4px;
}
.popover-list {
  max-height: 400px;
  overflow-y: auto;
}
.sub-item {
  padding: 10px 16px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.sub-item:hover {
  background-color: rgba(24, 144, 255, 0.2);
  color: #1890ff;
}
.sub-item.sub-active {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  font-weight: bold;
}

/* 无子菜单时的 Tooltip */
.tooltip {
  position: absolute;
  left: 70px;
  top: 10px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
}
.tooltip::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent rgba(0, 0, 0, 0.85) transparent transparent;
}

/* 主内容区 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 5; /* 确保内容在地图之上 */
  pointer-events: none; /* 让鼠标事件默认穿透到地图 */
}

/* 顶部导航 */
.navbar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  pointer-events: auto; /* 恢复鼠标交互 */
}
.glass-effect {
  background: linear-gradient(180deg, rgba(0, 12, 23, 0.8) 0%, rgba(0, 12, 23, 0) 100%);
  color: #e6f7ff;
}
.breadcrumb {
  font-size: 14px;
  color: #a6adb4;
}
.logout-btn {
  margin-left: 15px;
  padding: 5px 12px;
  background-color: transparent;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.logout-btn:hover {
  background-color: #ff4d4f;
  color: white;
}

/* 核心路由层: 各个业务组件在这里决定自己的尺寸和位置 */
.app-main {
  flex: 1;
  padding: 15px;
  position: relative;
  pointer-events: none; /* 穿透 */
}

/* 在各个页面的内部根元素中，需要增加 pointer-events: auto 来接收点击事件，
   否则点击会穿透到地图。我们通过全局注入一个 .page-container 的默认样式来实现 */
:deep(.page-container) {
  pointer-events: auto;
  background-color: rgba(0, 21, 41, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 20px;
  color: white;
  /* 默认情况占据全屏，如果是大屏等业务可以在其对应的 vue 组件里重写宽高 */
  height: 100%;
  overflow-y: auto;
}
</style>
