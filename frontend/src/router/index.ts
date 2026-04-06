import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../store/user';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '统一登录页' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '数字孪生大屏' }
      },
      {
        path: 'scada/overview',
        name: 'ScadaOverview',
        component: () => import('../views/scada/overview.vue'),
        meta: { title: '全局态势感知' }
      },
      {
        path: 'scada/topology',
        name: 'ScadaTopology',
        component: () => import('../views/scada/topology.vue'),
        meta: { title: '2D拓扑与分区导航' }
      }
      // TODO: 后续的动态路由，此处暂时写死核心页作为示例
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token || localStorage.getItem('token');
  
  if (to.path === '/login') {
    if (token) {
      next('/'); // 已经登录过，直接跳首页
    } else {
      next(); // 正常去登录页
    }
  } else {
    // 访问需要权限的页面
    if (!token) {
      // 没 token 打回登录页
      next(`/login?redirect=${to.path}`);
    } else {
      // 有 token，放行
      next();
    }
  }
});

export default router;
