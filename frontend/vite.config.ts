import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// 基础的 Vite 配置
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173, // 前端默认开发端口
    open: false,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/system/hmi': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/system/asset': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/system': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/menus': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/scada/overview': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/scada': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/api/v1/analytics': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/governance': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/data-center': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/v1/workflow': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
});