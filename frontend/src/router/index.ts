import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store/user';

// 基础静态路由
export const constantRoutes: Array<RouteRecordRaw> = [
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
    redirect: '/scada/overview',
    children: []
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
});

// 动态导入 views 下的组件映射
const modules = import.meta.glob('../views/**/*.vue');

// 路由拦截器与动态挂载
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.path === '/login') {
    if (token) next('/'); 
    else next(); 
    return;
  }

  if (!token) {
    next(`/login?redirect=${to.path}`);
    return;
  }

  const userStore = useUserStore();
  
  // 判断是否已经拉取过动态菜单
  if (userStore.menus && userStore.menus.length > 0) {
    next();
  } else {
    try {
      // 触发拉取后端动态菜单接口
      const menus = await userStore.fetchMenus();
      
      // 解析后端菜单数据，将其注册到 Vue Router 的 Layout 的 children 中
      const formatRoutes = (menuList: any[]): RouteRecordRaw[] => {
        const routes: RouteRecordRaw[] = [];
        menuList.forEach(menu => {
          // 只处理目录(M)和菜单(C)，忽略按钮(F)
          if (menu.menu_type === 'M' || menu.menu_type === 'C') {
            const route: RouteRecordRaw = {
              path: menu.path || '',
              name: menu.menu_name,
              meta: { title: menu.menu_name },
              children: menu.children && menu.children.length > 0 ? formatRoutes(menu.children) : []
            };

            if (menu.menu_type === 'C' && menu.component) {
              // 动态匹配 views 下的 Vue 组件
              const componentPath = `../views/${menu.component}.vue`;
              route.component = modules[componentPath];
            }
            routes.push(route);
          }
        });
        return routes;
      };

      const dynamicRoutes = formatRoutes(menus);
      
      dynamicRoutes.forEach(route => {
        router.addRoute('Layout', route);
      });

      // 挂载完毕后，触发重新导航 (replace 确保不会进入死循环)
      next({ ...to, replace: true });
    } catch (error) {
      console.error('动态路由挂载失败', error);
      userStore.logout();
      next(`/login`);
    }
  }
});

export default router;
