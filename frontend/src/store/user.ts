import { defineStore } from 'pinia';
import request from '../utils/request';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null as any,
    menus: [] as any[]
  }),
  actions: {
    async login(loginForm: any) {
      const res = await request.post('/auth/login', loginForm);
      if (res.access_token) {
        this.token = res.access_token;
        localStorage.setItem('token', res.access_token);
        this.userInfo = res.user;
      }
      return res;
    },
    async fetchMenus() {
      const res = await request.get('/api/menus/my-menus');
      this.menus = res;
      return res;
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      this.menus = [];
      localStorage.removeItem('token');
    }
  }
});
