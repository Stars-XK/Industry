import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';

// 定义接口响应的基础结构
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env ? import.meta.env.VITE_API_BASE_URL || '' : '',
  timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    // 假设使用 localStorage 存储 Token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // 如果自定义 code 不为 200，视为业务错误
    if (res.code !== 200) {
      console.error(`[API Error]: ${res.message}`);
      // 结合 UI 组件库弹出全局错误提示
      ElMessage.error(res.message || 'Error');
      
      // 401: Token 过期或未登录
      if (res.code === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data;
  },
  (error) => {
    console.error(`[HTTP Error]: ${error.message}`);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 重写 service 类型以支持直接返回 data
export default service as any;
