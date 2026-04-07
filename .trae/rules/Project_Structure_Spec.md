# 信创工业综合治理平台 - 工程目录与微服务结构规范 (Project Structure Spec)

本文档定义了平台前端、后端微服务及边缘网关组件的整体工程目录结构与职责划分，以指导开发团队进行脚手架搭建与代码开发。

---

## 1. 整体架构与 Monorepo 划分 (Root Directory)

系统采用 **Monorepo (单体仓库)** 或同级的目录隔离模式进行管理。

```text
/workspace (Root)
├── /frontend               # 前端工程 (Vue3 / React + Vite)
├── /backend                # 后端微服务工程 (NestJS + TypeORM)
├── /edge-gateway           # 边缘计算与网关脚本 (Python / Node.js)
├── /docs                   # 业务文档、架构图与部署手册
└── /.trae/rules            # AI 与开发人员需遵循的设计规范与全局规则 (如 PRD、DB结构等)
```

---

## 2. 前端工程结构 (Frontend - Vue3 示例)

采用大前端架构（Monolithic Frontend），通过模块化分包来隔离不同的业务域。

```text
/frontend
├── /src
│   ├── /api                # 按业务域划分的 API 请求封装 (如 scada.ts, analytics.ts)
│   ├── /assets             # 静态资源 (图片、字体、全局 CSS)
│   ├── /components         # 全局复用 UI 组件 (如 自定义图表、视频播放器、公共弹窗)
│   ├── /hooks              # 组合式 API 钩子 (如 useMqtt, usePermission)
│   ├── /layout             # 全局布局 (侧边栏、顶部导航、大屏全屏容器)
│   ├── /router             # 路由配置 (严格遵循 Frontend_Router_Menu.md 规范)
│   ├── /store              # 全局状态管理 (Pinia - 存储用户态、权限字典、全局拓扑)
│   ├── /utils              # 工具类 (请求拦截器 request.ts, PCHIP插值算法, 脱敏处理)
│   └── /views              # 视图层 (业务页面，按模块拆分)
│       ├── /login          # 登录页
│       ├── /dashboard      # 3D/WebGL 数字孪生大屏
│       ├── /scada          # SCADA 监控、工艺组态与安防监控
│       ├── /analytics      # DMA漏损报表、营收计费、AI预测分析
│       ├── /workflow       # 工单、报警风暴收敛、SOP预案管理
│       ├── /governance     # 时序规则、网关映射、数据清洗配置
│       └── /system         # RBAC权限、台账、字典、审计日志
├── /public                 # 无需编译的静态资源 (如 离线地图瓦片, 3D 模型文件)
├── vite.config.ts          # Vite 构建配置 (配置代理跨域、分包策略)
└── package.json            # 依赖管理
```

---

## 3. 后端工程结构 (Backend - NestJS 微服务)

采用 **NestJS Monorepo Workspaces** 结构。按粗粒度的业务领域（Domain-Driven Design, DDD）拆分微服务，利用 Redis 或 NATS 进行服务间通信。

```text
/backend
├── /apps                           # 微服务应用集群
│   ├── /api-gateway                # 统一 API 网关 (负责鉴权、路由转发、限流防暴破)
│   ├── /auth-service               # RBAC、组织架构与安全审计服务
│   ├── /scada-service              # SCADA 监控、拓扑管理与反控指令下发
│   ├── /data-center                # 数据中台 (TDengine 时序数据查询、清洗规则、报表统计)
│   ├── /workflow-service           # 工单流转、报警根因分析(RCA)与应急协同
│   └── /iot-bridge                 # 物联网内部桥接服务 (MQTT 报文解析、标签映射写入)
├── /libs                           # 微服务间共享库 (Shared Libraries)
│   ├── /common                     # 公共拦截器、异常过滤器、通用 DTO 与装饰器
│   ├── /database                   # 数据库连接模块 (MySQL/TypeORM & TDengine SDK)
│   ├── /redis                      # Redis 缓存与微服务心跳注册模块
│   └── /entities                   # 跨服务共享的 ORM 实体类 (严格遵循 DB Schema)
├── nest-cli.json                   # NestJS 工作区配置
└── package.json                    # 依赖管理
```

### 微服务核心职责边界：
1. **`api-gateway`**: 直接面向前端，处理 HTTP/WebSocket 接入，拦截无效请求并分发给后端。不直接连数据库。
2. **`auth-service`**: 连接 MySQL 的 `sys_*` 表，处理登录、Token 签发、权限范围校验。
3. **`data-center`**: 重度依赖 TDengine，处理报表、产销差计算、聚合查询；同时也读取 MySQL 中的大户档案 (`bil_*`)。
4. **`workflow-service`**: 连接 MySQL 的 `wf_*` 和 `alm_*` 表，驱动工单状态机。
5. **`iot-bridge`**: 作为一个“翻译官”，订阅 MQTT Broker 的原始报文，查询 `iot_tag_mapping`，然后批量高速写入 TDengine 的子表。

---

## 4. 边缘计算与网关工程 (Edge Gateway)

由于工业现场环境复杂，单独划分边缘层代码。部署在厂区工控机或工业路由器上。

```text
/edge-gateway
├── /protocols              # 协议解析插件 (Modbus RTU/TCP, OPC UA, S7)
├── /buffer                 # 本地断网缓存机制 (SQLite/本地文件队列)
├── /filters                # 边缘过滤与清洗 (死区 Deadband 拦截、极值丢弃)
├── /mqtt_client            # 上云客户端 (将标准化 JSON 通过 MQTT 推送至云端)
└── main.py / app.js        # 边缘网关主入口
```