module.exports = {
  apps: [
    // ==========================================
    // 1. 后端 NestJS 微服务集群 (Node.js)
    // 编译后产物通常位于 /backend/dist/apps/{app-name}/main.js
    // ==========================================
    {
      name: 'api-gateway',
      script: './backend/dist/apps/api-gateway/main.js',
      instances: 1,                 // 网关可以根据 CPU 核心数扩展为 'max'
      exec_mode: 'cluster',         // 开启集群模式提高并发并发
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'auth-service',
      script: './backend/dist/apps/auth-service/main.js',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'scada-service',
      script: './backend/dist/apps/scada-service/main.js',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'data-center',
      script: './backend/dist/apps/data-center/main.js',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    },
    {
      name: 'workflow-service',
      script: './backend/dist/apps/workflow-service/main.js',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      }
    },
    {
      name: 'iot-bridge',
      script: './backend/dist/apps/iot-bridge/main.js',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      }
    },

    // ==========================================
    // 2. 边缘网关服务 (Python)
    // ==========================================
    {
      name: 'edge-gateway',
      script: './edge-gateway/main.py',
      interpreter: 'python3',       // 指定 Python 解释器
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
