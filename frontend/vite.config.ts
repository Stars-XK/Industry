import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 基础的 Vite 配置
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
  },
});