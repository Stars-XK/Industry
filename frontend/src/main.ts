import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/premium-theme.css'; // 引入全局工业级玻璃拟态暗黑主题样式
import App from './App.vue';
import router from './router';
import { useUserStore } from './store/user';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 注册全局权限指令 v-hasPermi
app.directive('hasPermi', {
  mounted(el, binding) {
    const { value } = binding;
    // 这里获取全量权限或菜单权限等进行比对，由于未实现详细 store.permissions 逻辑
    // 工业级后台通常使用 userStore 里的 permissions，这里用简单占位逻辑实现通过
    const userStore = useUserStore();
    const permissions = userStore.userInfo?.permissions || ['*:*:*'];

    if (value && value instanceof Array && value.length > 0) {
      const permissionRoles = value;
      const hasPermission = permissions.some((role: string) => {
        return role === '*:*:*' || permissionRoles.includes(role);
      });

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error(`请设置操作权限标签值`);
    }
  }
});

app.mount('#app');
