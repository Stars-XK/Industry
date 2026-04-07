# 信创工业综合治理平台 (Industrial Comprehensive Governance Platform)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)]()
[![Vue3](https://img.shields.io/badge/Vue-3.x-brightgreen)]()
[![TDengine](https://img.shields.io/badge/TDengine-3.3.8-orange)]()

## 📝 项目简介
这是一个符合国家信创标准的**工业级综合治理平台**，核心聚焦于**水务管理、能源分析、SCADA监控、数字孪生以及工单应急协同**。平台通过打通底层物联网设备数据与上层业务管理闭环，旨在实现百亿级时序数据的高效清洗降采样、产销差漏损精准分析及智能报警风暴压制。

## 🏗️ 核心架构选型
系统采用**前后端分离 + 微服务架构**，并在数据库层引入了“冷热分离”的双底座设计：
*   **前端工程 (`/frontend`)**: Vue 3 + Vite + TypeScript + Pinia + Vue Router (基于角色的动态路由与动态组件加载)。
*   **后端微服务 (`/backend`)**: 基于 NestJS (Monorepo) 搭建的 6 大核心微服务 (包含 `api-gateway`, `auth-service`, `scada-service`, `data-center`, `workflow-service`, `iot-bridge`)，支持并发协同启动。
*   **边缘计算 (`/edge-gateway`)**: Python 编写的轻量级边缘网关，用于处理工业现场的协议解析 (MQTT/Modbus/OPC)、死区过滤及断网缓存。
*   **关系型数据库底座**: MySQL 8.0+，用于存储组织架构、角色权限、设备台账及工单状态。
*   **时序数据库底座**: TDengine 3.3.8+，专职存储海量高频传感数据，并利用 `CREATE STREAM` 实现 5 分钟、日、月、年及夜间最小流量 (MNF) 的流式降采样计算。

## 📂 项目结构
```text
/workspace
├── /frontend               # Vue3 业务大前端
├── /backend                # NestJS 后端微服务集群
│   ├── /apps               # 6 大核心微服务
│   ├── /libs               # 共享库与 TypeORM 实体类
│   └── /scripts            # 数据库初始化与迁移脚本
├── /edge-gateway           # 工业边缘网关代码
├── /docs                   # 项目详细设计文档(PRD、路由规范等)
├── /.trae/rules            # 全局架构与开发约束规则
├── ecosystem.config.js     # PM2 生产环境进程配置
└── README.md               # 本文件
```

## 🚀 快速启动与本地开发

### 1. 环境准备
*   Node.js >= 18
*   MySQL >= 8.0 (需在本地或远端启动)
*   TDengine >= 3.3.8 (确保 RESTful 服务端口 6041 已开放)
*   MQTT Broker (如 EMQX / Mosquitto，用于阶段二测试)

### 2. 数据库一键初始化
后端内置了自动化脚本，会为您建好 MySQL 基础表结构、插入初始管理员账号与测试设备，并在 TDengine 中创建超级表与流计算脚本。
```bash
cd backend
npm install
# 执行初始化脚本 (确保 MySQL 和 TDengine 均已启动)
npm run db:init
```
*(注：默认超管账号: `admin`，密码: `admin123`)*

### 3. 启动后端微服务集群
得益于 `concurrently` 的集成，您可以一键启动全部 6 个 NestJS 微服务。
```bash
cd backend
npm install
# 启动所有微服务 (开发模式/支持热重载)
npm run start:all:dev
```

### 4. 启动前端项目
```bash
cd frontend
npm install
npm run dev
```

### 5. 生产环境部署 (基于 PM2)
项目根目录提供了 `ecosystem.config.js`，编译打包后可在服务器上通过 PM2 一键守护全部服务：
```bash
# 编译后端
cd backend && npm run build
cd ..
# 使用 PM2 启动集群
pm2 start ecosystem.config.js
```

## 📜 设计规范参考
在进行二次开发前，请务必阅读以下存储于 `/.trae/rules/` 目录下的核心设计规范文档：
1.  [Development_Roadmap.md](/.trae/rules/Development_Roadmap.md) - 项目全生命周期开发进度与里程碑
2.  [Database_Schema_Design.md](/.trae/rules/Database_Schema_Design.md) - 详细的双底座数据表与字段设计
3.  [Frontend_Router_Menu.md](/.trae/rules/Frontend_Router_Menu.md) - 前端菜单与权限路由映射表
4.  [Project_Structure_Spec.md](/.trae/rules/Project_Structure_Spec.md) - 微服务与包拆分规范
