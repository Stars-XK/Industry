import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 基础的 Vite 配置
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // 前端默认开发端口
    open: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:3001', // auth-service 所在的端口
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001', // 后端微服务或网关所在的端口
        changeOrigin: true,
      }
    }
  },
});