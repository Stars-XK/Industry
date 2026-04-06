import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '../store/user';

// 定义静态的白名单路由
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
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Vite 环境下动态导入 modules 的黑科技 (匹配 src/views 下所有 vue 文件)
const modules = import.meta.glob('../views/**/*.vue');

// 将后端树形菜单转换为平铺的 Vue Router 路由对象并注入
export const generateDynamicRoutes = (menuTree: any[]) => {
  const addRouteRecursively = (menus: any[], parentPath: string = '') => {
    menus.forEach(menu => {
      // 仅当是 C 菜单且有 component 时才挂载路由
      if (menu.menu_type === 'C' && menu.component) {
        // 防止后端路径缺少斜杠
        const routePath = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path;
        const fullPath = parentPath ? `${parentPath}/${routePath}` : routePath;

        // 匹配真实的 vue 文件组件
        const componentPath = `../views/${menu.component}.vue`;
        
        if (modules[componentPath]) {
          router.addRoute('Layout', {
            path: fullPath,
            name: menu.menu_name,
            component: modules[componentPath],
            meta: { title: menu.menu_name, perm_code: menu.perm_code }
          });
        } else {
          console.warn(`[Vue Router]: 找不到组件 ${componentPath}`);
        }
      }
      
      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        const nextParent = parentPath ? `${parentPath}/${menu.path}` : menu.path;
        addRouteRecursively(menu.children, nextParent);
      }
    });
  };

  addRouteRecursively(menuTree);
};

// 标记是否已经生成过动态路由
let isDynamicRoutesGenerated = false;

// 全局前置路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token || localStorage.getItem('token');
  
  if (to.path === '/login') {
    if (token) {
      next('/'); 
    } else {
      next(); 
    }
  } else {
    // 访问需要权限的页面
    if (!token) {
      next(`/login?redirect=${to.path}`);
    } else {
      // 如果有 token，但还未生成动态路由，则拉取菜单并注入
      if (!isDynamicRoutesGenerated) {
        try {
          const menus = await userStore.fetchMenus();
          generateDynamicRoutes(menus);
          isDynamicRoutesGenerated = true;
          // 路由已经动态添加，重新触发本次导航以匹配新路由
          next({ ...to, replace: true });
        } catch (error) {
          console.error('动态路由注入失败:', error);
          userStore.logout();
          next('/login');
        }
      } else {
        next();
      }
    }
  }
});

export default router;

