# 信创工业综合治理平台 - Code Wiki

本文档对“信创工业综合治理平台”的工程仓库进行全面解析，涵盖项目整体架构、主要模块职责、关键类与函数说明、依赖关系及本地运行方式。

---

## 1. 项目整体架构 (Overall Architecture)

本项目是一个符合国家信创标准的工业级综合治理平台，采用 **前后端分离 + 后端微服务 + 边缘计算** 的综合架构，代码仓库以 **Monorepo (单体仓库)** 形式进行组织。

### 1.1 核心技术栈
*   **前端工程**: Vue 3 + Vite + TypeScript + Element Plus + ECharts + Leaflet (大前端单体架构)
*   **后端集群**: NestJS (微服务架构) + TypeORM + JWT
*   **边缘计算与模拟**: Python 3 + Node.js
*   **双底座数据库**:
    *   **MySQL 8.0+** (冷数据/业务关系数据)：存储用户、角色权限、设备台账、工单状态等。
    *   **TDengine 3.3.8+** (热数据/时序数据)：存储百亿级工业传感器高频数据，利用内部流计算 (`CREATE STREAM`) 实现降采样。
*   **消息中间件**: Redis (缓存与状态), MQTT (物联网数据传输)
*   **生产部署**: PM2 (`ecosystem.config.js`)

### 1.2 目录拓扑
```text
/workspace
├── /frontend               # 前端 Web 工程 (Vue3)
├── /backend                # 后端微服务工程 (NestJS)
│   ├── /apps               # 6大核心微服务
│   └── /libs               # 共享库 (数据库连接、公共拦截器、实体类)
├── /edge-gateway           # 边缘计算网关代码 (Python)
├── /data-simulator         # 工业数据模拟推送工程 (Node.js)
├── /docs                   # 项目产品文档及设计图
└── /.trae/rules            # 系统架构、数据库设计与开发规范约束 (核心参考)
```

---

## 2. 主要模块职责 (Module Responsibilities)

### 2.1 前端工程 (`/frontend`)
前端以业务域划分为不同的视图与组件：
*   **`src/views/`**: 承载所有的业务页面。
    *   `dashboard/`: 承载 3D 沉浸式监控大屏 (`index.vue`)。
    *   `scada/`: 2D 拓扑、HMI 组态、全局态势感知、安防监控。
    *   `analytics/`: 产销差漏损报表（全域覆盖）、夜间最小流量 (MNF 全部分区)、计费对账、预测分析。
    *   `workflow/`: 报警风暴收敛、工单流转、排班调度、SOP 应急。
    *   `governance/`: 时序数据规则、数据源接入、传感器健康度、边缘标签映射。
    *   `system/`: 组织架构、RBAC、台账、数据字典、系统配置。
*   **`src/api/`**: 按照后端微服务边界封装的 Axios 请求接口。
*   **`src/store/`**: Pinia 状态管理，保存全局用户状态、字典缓存等。
*   **`src/layout/`**: 系统的基础导航框架（侧边栏、顶栏）。顶栏右上角特设**“工业数据流转与平台治理全景图”**常驻入口（Drawer 抽屉形式展现数据流脉络）。

### 2.2 后端微服务集群 (`/backend/apps`)
基于 NestJS Monorepo 构建了 6 大独立微服务：
1.  **`api-gateway` (Port: 3000)**: 统一 API 网关，负责 HTTP/WebSocket 接入、全局路由转发、鉴权与限流。
2.  **`auth-service` (Port: 3001)**: 权限中心。连接 MySQL，处理登录、JWT 签发、RBAC 菜单授权及操作审计日志。
3.  **`scada-service` (Port: 3002)**: 监控与控制中心。处理 DMA 拓扑树，下发设备反控指令至 MQTT。
4.  **`data-center` (Port: 3003)**: 数据中台。重度依赖 TDengine，执行报表查询、流计算降采样提取、预测分析与产销差计算。
5.  **`workflow-service` (Port: 3004)**: 运维协同。处理工单状态机、报警根因分析 (RCA)、库存领料及应急预案 (SOP)。
6.  **`iot-bridge` (Port: 3005)**: 物联网内部桥接服务。订阅 MQTT 报文，解析硬件标签，通过高速写入通道推入 TDengine 时序库。

### 2.3 边缘网关与模拟器
*   **`edge-gateway` (边缘网关)**: Python 编写，使用 `paho-mqtt` 库。模拟真实厂区工控机，收集 `meter`, `pump`, `water_quality`, `environment` 数据并定时推送到云端 MQTT Broker，同时监听 `command/devices/+/set` 主题执行反控。
*   **`data-simulator` (数据模拟器)**: Node.js 编写，使用 `node-cron` 和 `axios`。通过 RESTful 接口直接向 TDengine 数据库插入带正弦波动或递增趋势的模拟传感器数据，用于报表测试。

---

## 3. 关键类与函数说明 (Key Classes & Functions)

### 3.1 前端核心
*   **`utils/request.ts`**: Axios 全局拦截器。封装了全局 Token 注入、统一的 Loading 交互以及网络错误/无权限的弹窗提示。
*   **`hooks/useDict.ts`**: 字典数据 Hook。用于从 `Pinia` 或后端快速加载系统配置的枚举字典（如设备类型、报警级别）。
*   **`router/index.ts`**: 动态路由控制。基于登录用户的角色，通过 `router.addRoute` 动态挂载后端返回的菜单组件，实现前端鉴权。

### 3.2 后端核心 (`/backend/libs/` 及微服务)
*   **`database/tdengine.service.ts`**: 封装了与 TDengine 通信的 HTTP RESTful 客户端（基于 Base64 账号鉴权），提供原生的 `INSERT` 与查询下推执行能力。
*   **`common/filters/all-exceptions.filter.ts`**: 全局异常过滤器，捕获微服务中的各种异常并统一转换为 `{ code, data, message }` 结构返回给网关。
*   **`entities/*.entity.ts`**: TypeORM 实体定义。严格映射了 MySQL 中的核心表结构（如 `user.entity.ts`, `ast-device.entity.ts`, `dma-zone.entity.ts`）。
*   **`iot-bridge/mqtt.service.ts`**: 物联网通信核心，监听设备遥测主题，将底层的 PLC 地址数据映射为时序库标签并批量入库。

### 3.3 边缘与模拟端核心
*   **`edge-gateway/main.py -> on_message()`**: 边缘网关反控回调函数。接收下发的控制指令（如设定变频泵频率），并更新网关本地的 `device_states`。
*   **`data-simulator/index.js -> getSimulatedPressure()`**: 数据生成算法，使用 `Math.sin()` 结合时间戳生成带规律的工业压力波动曲线。

---

## 4. 核心业务模块与代码实现逻辑 (Core Business Implementation Logic)

### 4.1 综合业务监控台 (SCADA & Monitor)
该模块负责厂区与管网运行状态的实时可视化感知，核心在于处理物理设备拓扑以及工艺组态画面的渲染与联动。
*   **前端对应**: `views/scada/overview.vue` (全局态势)、`topology.vue` (2D拓扑与导航)、`hmi.vue` (工艺组态)。
*   **后端对应**: `scada-service` (`TopologyController`, `HmiController`)。
*   **业务逻辑**: 
    *   **动态拓扑树与报警状态**: `TopologyController` 结合 MySQL DMA 物理拓扑层级与时序报警数据（如硫化氢超标、压力过低），动态下发触发报警的节点，驱动前端进行节点红/黄/绿颜色渲染。
    *   **资产挂载防呆**: 拓扑节点在存在子节点或挂载设备（进/出水分表）时禁止删除。
    *   **HMI组态与双向反控**: 前端组态画布与后端交互持久化配置，提供对底层 PLC 设备的双向握手反控通道。

### 4.2 核心数据流转与多维统计分析 (Data Flow & Analytics)
作为系统数据价值变现核心，它涵盖了底层硬件到上层商业的完整流转链路：
*   **前端对应**: `views/analytics/nrw.vue` (产销差漏损)、`mnf.vue` (夜间最小流量)、`billing.vue` (营收计费)。
*   **后端对应**: `data-center` (`NrwController`, `BillingController`)。
*   **业务逻辑**:
    *   **供水端计算**: 原始瞬时流量通过清洗聚合得出“设备五分钟瞬时流量”，进而提取“2:00-4:00夜间最小流量 (MNF)”；累计流量通过时间切割得出“设备日用量”，汇总至分区得出“分区日供水量 / 月供水量”。
    *   **营收售水端计算**: 根据接入的营收用户数据类型（日/月/累计）算出单个用户用量，再关联至分区内的水卡信息，汇总为“分区日售水量 / 月售水量”。
    *   **全域产销差与报表展示**: 供水量减去售水量计算出最终产销差。系统要求**全域展示**（涵盖所有的分区），提供全部 DMA 分区的日报、月报、产销差及夜间最小流量看板，避免局部“面子工程”。

### 4.3 运维治理与协同闭环 (Workflow)
将异常数据转化为生产力，打通“报警 -> 根因分析 -> 派单 -> 闭环处理”的完整生命周期。
*   **前端对应**: `views/workflow/alarm.vue` (报警收敛)、`work-order.vue` (工单)、`duty.vue` (排班)。
*   **后端对应**: `workflow-service` (`AlarmController`, `OrderController`)。
*   **业务逻辑**:
    *   **报警风暴收敛**: 支持报警的生命周期管理（确认、消音、恢复），结合应急预案 (SOP) 规则动态配置。
    *   **工单状态机流转**: 支持从报警自动化触发建单，包含待接单、处理中、已闭环状态，绑定 GIS 坐标追踪创建人和处理人。
    *   **闭环与SLA超时**: 提供工单转派、填写处理结果及审核闭环机制，全程监控状态流转时间以计算 SLA 超时。

### 4.4 数据中台与治理 (Governance)
作为系统的底层基座，负责时序数据清洗、设备标签映射和报警软联锁。
*   **前端对应**: `views/governance/interpolate.vue` (数据清洗插值)、`interlock.vue` (报警联锁)、`edge-tag.vue` (边缘测点映射)。
*   **后端对应**: `data-center` (`GovernanceController`, `InterlockController`)。
*   **业务逻辑**:
    *   **数据清洗与插值重算**: 针对测点提供断点插值策略（如线性插值、PCHIP）。在提交“历史重算”任务时，立即锁定状态防篡改。
    *   **软联锁规则引擎 (Cause & Effect)**: 支持工业级自动化联锁配置（如“硫化氢超标”触发“开启排风扇并锁门”）。
    *   **高级旁路 (Bypass)**: 允许高级工程师对特定联锁动作实施旁路干预（屏蔽自动控制）。
    *   **设备映射联动**: 维护物联网网关及测点标签 (PLC寄存器到全局 Tag 的映射)，提供严格的向下穿透校验机制。

---

## 5. 依赖关系 (Dependencies)

### 5.1 前端依赖 (`frontend/package.json`)
*   **框架**: `vue` (^3.3.4), `vite` (^4.4.5), `typescript`
*   **UI 与 可视化**: `element-plus` (组件库), `echarts` & `vue-echarts` (图表), `leaflet` (2D 地图)
*   **状态与路由**: `pinia`, `vue-router`
*   **网络与通信**: `axios`, `socket.io-client`

### 5.2 后端依赖 (`backend/package.json`)
*   **框架**: `@nestjs/core`, `@nestjs/common`, `@nestjs/microservices` (^10.0.0)
*   **数据库与缓存**: `typeorm` (MySQL ORM), `mysql2`, `ioredis` (Redis 客户端)
*   **鉴权与安全**: `bcrypt` (密码哈希), `passport`, `passport-jwt`
*   **物联网**: `mqtt`, `aedes` (可内嵌的 MQTT Broker)
*   **其他**: `rxjs`, `socket.io`, `xlsx` (Excel导入导出)

### 5.3 边缘与模拟依赖
*   **Edge Gateway**: `paho-mqtt` (Python MQTT 客户端)
*   **Data Simulator**: `node-cron` (定时任务), `axios` (RESTful 通信)

---

## 6. 项目运行方式 (How to Run)

### 6.1 环境准备
在本地启动前，请确保安装并启动以下基础设施：
1.  **Node.js**: >= 18.x
2.  **Python**: >= 3.8 (运行边缘网关)
3.  **MySQL**: >= 8.0 (默认端口 3306)
4.  **TDengine**: >= 3.3.8 (确保 RESTful 服务端口 6041 可访问)
5.  **MQTT Broker**: (如 EMQX，用于 IoT 数据收发，默认 1883)

### 6.2 数据库一键初始化
后端工程提供了自动化脚本，一键创建 MySQL 表结构、初始化超级管理员，并在 TDengine 中创建时序数据库与超级表：
```bash
cd backend
npm install
npm run db:init
```
*(注：默认超级管理员账号：`admin`，密码：`admin123`)*

### 6.3 本地开发启动
项目利用 `concurrently` 实现了微服务的一键协同启动：

**启动后端集群 (含热重载)**:
```bash
cd backend
npm run start:all:dev
# 这将依次启动网关(3000)、认证(3001)、SCADA(3002)、数据中台(3003)、工作流(3004)、IoT桥接(3005)
```

**启动前端大前端工程**:
```bash
cd frontend
npm install
npm run dev
# 默认将在本地的 5173 端口启动
```

**启动数据模拟服务**:
```bash
cd data-simulator
npm install
node src/index.js
```

**启动边缘网关模拟器**:
```bash
cd edge-gateway
pip install -r requirements.txt
python main.py
```

### 6.4 生产环境部署
在生产环境中，推荐使用 **PM2** 进行集群守护和进程管理：
```bash
# 1. 编译前端工程
cd frontend && npm run build

# 2. 编译后端微服务集群
cd backend && npm run build

# 3. 回到项目根目录，使用 ecosystem.config.js 启动所有 Node.js 与 Python 进程
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 logs
```
