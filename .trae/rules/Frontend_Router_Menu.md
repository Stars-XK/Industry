# 信创工业综合治理平台 - 前端路由与菜单规范 (Frontend Router & Menu Spec)

本文档基于《前端菜单与页面功能设计规范》（Frontend_Menu_Spec.md），定义了平台前端工程（如 Vue3 / React）的菜单层级、路由结构、组件划分及权限标识。它是 UI/UX 设计师进行页面排版、前端工程师搭建工程路由架构的直接依据。

---

## 1. 路由与菜单总览结构 (Menu Tree)

```text
/ (Root)
├── /login                   [登录与门户] 统一登录页 (Login)
├── /dashboard               [登录与门户] 沉浸式数字孪生大屏 (Digital Twin Dashboard)
├── /scada                   [综合业务监控台] (SCADA & Monitor)
│   ├── /scada/overview        - 全局态势感知 (Overview Dashboard)
│   ├── /scada/hmi             - 工业 SCADA 工艺组态 (SCADA HMI)
│   └── /scada/security        - 安防与环境空间监控 (Security & Environment)
├── /analytics               [多维统计与数据分析] (Data Analytics)
│   ├── /analytics/nrw         - DMA 产销差与漏损报表 (NRW & Leakage Reports)
│   ├── /analytics/mnf         - 夜间最小流量分析 (MNF Analysis)
│   ├── /analytics/key-account - 大用户档案与重点企业画像 (Key Account Monitoring)
│   ├── /analytics/billing     - 营收计费与出账对账管理 (Billing & Reconciliation)
│   ├── /analytics/energy      - 综合能效优化与动态成本核算 (Energy & Cost Optimization)
│   ├── /analytics/predict     - 用量与能耗 AI 预测分析 (Predictive Analytics)
│   └── /analytics/hydraulic   - 在线水力模型仿真与推演 (Hydraulic Modeling)
├── /workflow                [运维治理与协同闭环] (O&M & Workflow)
│   ├── /workflow/alarm        - 报警风暴收敛中心 (Alarm Center)
│   ├── /workflow/work-order   - 工单与巡检全生命周期管理 (Work Order Management)
│   ├── /workflow/aigc         - AI 智能调度与协同指挥 (AIGC & Command)
│   ├── /workflow/duty         - 消息通知与排班调度 (Notification & Duty)
│   └── /workflow/sop          - 应急预案与 SOP 数字化管理 (SOP & Emergency)
├── /governance              [数据中台与治理底座] (Data Governance)
│   ├── /governance/integration - 异构设备与数据源接入 (Data Integration)
│   ├── /governance/revenue    - 营收数据融合与清洗配置 (Revenue Data Cleansing)
│   ├── /governance/interpolate- 累积量换算与插值容错规则 (Data Interpolation Rules)
│   ├── /governance/interlock  - SCADA 报警联锁与规则引擎配置 (Interlock & Rule Engine)
│   ├── /governance/edge-tag   - 边缘网关与测点标签管理 (Edge & Tag Management)
│   ├── /governance/recipe     - 工业配方管理 (Recipe Management)
│   └── /governance/sensor     - 数据清洗与传感器健康度配置 (Data Quality & Sensor Health)
└── /system                  [系统设置与台账权限] (System & Security)
    ├── /system/asset          - 资产与设备台账 (Asset Management)
    ├── /system/inventory      - 备品备件与仓储管理 (Inventory & Spare Parts)
    ├── /system/org            - 组织架构与人员管理 (Organization)
    ├── /system/rbac           - 角色与权限体系 (RBAC Configuration)
    ├── /system/dict           - 数据字典管理 (Data Dictionary)
    ├── /system/audit          - 安全审计与脱敏日志 (Audit Logs)
    ├── /system/visual-studio  - 低代码可视化组态工作台 (Visual Studio)
    ├── /system/config         - 系统参数配置 (System Configuration)
    ├── /system/setup-wizard   - 快速发布初始化与覆盖导入 (Quick Setup & Override)
    └── /system/backup         - 数据库备份与恢复 (Database Backup)
```

---

## 2. 详细路由配置表

*说明：`组件层级` 表示在前端工程中的视图组件嵌套关系；`权限标识` (Permission Code) 用于按钮级和页面级的细粒度 RBAC 控制。*

### 2.1 登录与大屏门户 (Portal)
| 菜单/页面名称 | 路由路径 (Path) | 视图组件 (Component) | 权限标识 (Perm Code) | 核心承载功能 |
|---|---|---|---|---|
| 统一登录页 | `/login` | `views/login/index.vue` | `sys:login` | 多模态认证、防暴破滑动验证码、RBAC 权限拉取初始化 |
| 数字孪生大屏 | `/dashboard` | `views/dashboard/index.vue` | `sys:dashboard` | WebGL/3D 地图底座、安全间距分析、一图统管、爆管聚焦联动弹窗 |

### 2.2 综合业务监控台 (SCADA & Monitor)
| 菜单/页面名称 | 路由路径 (Path) | 视图组件 (Component) | 权限标识 (Perm Code) | 核心承载功能 |
|---|---|---|---|---|
| 全局态势感知 | `/scada/overview` | `views/scada/overview.vue` | `scada:overview` | KPI 卡片概览、水质综合看板、能耗趋势折线图 |
| 工业SCADA组态 | `/scada/hmi` | `views/scada/hmi.vue` | `scada:hmi` | 动态工艺图纸加载、设备启停/阀门PID无级调节、双向握手验证 |
| 安防与环境空间 | `/scada/security` | `views/scada/security.vue` | `scada:security` | RTSP 视频矩阵分屏、BIM 视频贴图(盲区展示)、密闭空间环境曲线及门禁联锁 |

### 2.3 多维统计与数据分析 (Data Analytics)
| 菜单/页面名称 | 路由路径 (Path) | 视图组件 (Component) | 权限标识 (Perm Code) | 核心承载功能 |
|---|---|---|---|---|
| DMA产销差与漏损 | `/analytics/nrw` | `views/analytics/nrw.vue` | `analytics:nrw` | 水量平衡桑基图、**全域全部分区**同环比与产销差展示、穿透下钻 |
| 夜间最小流量分析 | `/analytics/mnf` | `views/analytics/mnf.vue` | `analytics:mnf` | **全部分区** MNF 散点基线、大用户夜间合法用水剥离、声水热力图 |
| 重点企业大户画像 | `/analytics/key-account`| `views/analytics/account.vue` | `analytics:account` | 独立监控档案、"大表小用/表倒转" AI 诊断看板、换表建议单导出 |
| 营收计费与对账 | `/analytics/billing` | `views/analytics/billing.vue` | `analytics:billing` | 阶梯费率库配置、抄表差值出账、应收vs实收漏斗图、追缴单稽查 |
| 综合能效与成本核算 | `/analytics/energy` | `views/analytics/energy.vue` | `analytics:energy` | 药剂电费动态折算吨水成本、电量平衡模型(防窃电)、峰谷平排班降本建议表 |
| AI预测分析看板 | `/analytics/predict` | `views/analytics/predict.vue` | `analytics:predict` | ARIMA/LSTM 用水未来趋势曲线、辅助前置调度分析 |
| 在线水力模型推演 | `/analytics/hydraulic` | `views/analytics/hydraulic.vue`| `analytics:hydraulic` | 全网节点推演等压云图、What-If 关阀沙盘推演台、模拟方案转 SOP 工单 |

### 2.4 运维治理与协同闭环 (O&M & Workflow)
| 菜单/页面名称 | 路由路径 (Path) | 视图组件 (Component) | 权限标识 (Perm Code) | 核心承载功能 |
|---|---|---|---|---|
| 报警风暴收敛中心 | `/workflow/alarm` | `views/workflow/alarm.vue` | `work:alarm` | RCA 根因高亮列表、报警 ACK/消音、综合报警转抢修工单 |
| 工单与巡检生命周期 | `/workflow/work-order` | `views/workflow/order.vue` | `work:order` | 动态巡检路线配置、按状态分类工单看板、未计费水量冲销审批页、SLA 超时监控 |
| AI智能调度与指挥 | `/workflow/aigc` | `views/workflow/aigc.vue` | `work:aigc` | 对话式问答面板、防汛防冻前置指令生成、预案一键生成、人员车辆轨迹实时 GIS 追踪 |
| 消息通知与排班调度 | `/workflow/duty` | `views/workflow/duty.vue` | `work:duty` | 日历视图排班表(可拖拽)、短信/企微通知模板配置、报警级别条件路由配置 |
| 应急预案与SOP管理 | `/workflow/sop` | `views/workflow/sop.vue` | `work:sop` | 可视化预案流程编排(如水源地氨氮超标应对)、应急弹窗操作确认记录台 |

### 2.5 数据中台与治理底座 (Data Governance)
| 菜单/页面名称 | 路由路径 (Path) | 视图组件 (Component) | 权限标识 (Perm Code) | 核心承载功能 |
|---|---|---|---|---|
| 异构设备与数据源 | `/governance/integration`| `views/gov/integration.vue` | `gov:integration` | MQTT/HTTP 网关通道配置与 QPS 监控看板 |
| 营收数据融合清洗 | `/governance/revenue` | `views/gov/revenue.vue` | `gov:revenue` | 营收 Excel 导入、按日历平滑摊销分摊规则配置、历史追溯重算高危按钮 |
| 累积量插值容错 | `/governance/interpolate`| `views/gov/interpolate.vue` | `gov:interpolate` | PCHIP/线性插值算法切换、物理流速/异常极值剔除阈值配置、表计翻转补偿接续 |
| 报警联锁规则引擎 | `/governance/interlock`| `views/gov/interlock.vue` | `gov:interlock` | 因果矩阵(Cause&Effect)配置、联锁日志流水、高级旁路(Bypass)强制干预开关 |
| 边缘网关与测点标签 | `/governance/edge-tag` | `views/gov/edge-tag.vue` | `gov:edge` | 网关 CPU/网络监控、本地保护策略下发、PLC 寄存器与时序标签(Tag)映射表 |
| 工业配方管理 | `/governance/recipe` | `views/gov/recipe.vue` | `gov:recipe` | 多版本配方模板(流量/加药比例)、带电子签名的配方一键下发与进度监控 |
| 传感器健康度评估 | `/governance/sensor` | `views/gov/sensor.vue` | `gov:sensor` | 仪表的"在线率"及"有效率"图表、电池剩余寿命预警预测、死值/毛刺过滤规则设定 |

### 2.6 系统设置与台账权限 (System & Security)
| 菜单/页面名称 | 路由路径 (Path) | 视图组件 (Component) | 权限标识 (Perm Code) | 核心承载功能 |
|---|---|---|---|---|
| 资产与设备台账 | `/system/asset` | `views/system/asset.vue` | `sys:asset` | 无限级 2D 拓扑与资产挂载、型号/保修期记录、强制接续表单(防负流) |
| 备品备件与仓储 | `/system/inventory` | `views/system/inventory.vue`| `sys:inventory` | 安全库存红绿灯预警、扫码出库与工单成本绑定报表 |
| 组织架构与人员 | `/system/org` | `views/system/org.vue` | `sys:org` | 集团-厂区无限级拖拽树、人员账号分配与重置 |
| 角色与权限体系 | `/system/rbac` | `views/system/rbac.vue` | `sys:rbac` | 菜单/按钮细粒度勾选授权、数据范围隔离(如下拉选择"仅本人/本厂区") |
| 数据字典管理 | `/system/dict` | `views/system/dict.vue` | `sys:dict` | 全局枚举值动态配置中心(设备类型、管材、工单状态等) |
| 安全审计与脱敏 | `/system/audit` | `views/system/audit.vue` | `sys:audit` | 防篡改请求记录与 JSON Diff 对比、敏感信息(手机号/金额)默认动态掩码展示 |
| 低代码组态工作台 | `/system/visual-studio`| `views/system/visual.vue` | `sys:visual` | 内置 ISA 图元与 Echarts 的拖拽画布、属性与标签绑定配置面板、发布管理 |
| 系统参数配置 | `/system/config` | `views/system/config.vue` | `sys:config` | 网站标题、地图来源、邮箱短信配置等基础环境参数管理 (动态状态更新，无刷新生效) |
| 快速覆盖导入 | `/system/setup-wizard` | `views/system/wizard.vue` | `sys:wizard` | 大文件切片上传、断点续传、Excel数据覆盖与导入前强制自动备份 |
| 数据库备份恢复 | `/system/backup` | `views/system/backup.vue` | `sys:backup` | 定时备份策略设置、备份记录下载与一键 SQL 恢复 |

---

## 3. 布局与视图套嵌要求 (Layout & Views)

1. **基础布局层 (Base Layout)**
   - **`Layout` 框架**：包含侧边菜单栏 (Sidebar)、顶部导航条 (Navbar) 和主内容区域 (AppMain)。
   - **例外处理**：`/login` 与 `/dashboard` 为独立的一级全屏路由，**不嵌套**在标准 `Layout` 中。`/dashboard` 应具备隐藏顶栏和侧边栏的独立大屏交互体验。

2. **响应式与适配**
   - 基础 `Layout` 需支持在 `1366x768` 及以上分辨率下侧边栏平滑收缩为图标模式。
   - 所有数据分析表格（Analytics）与工单列表需配置 `overflow-x: auto` 及固定表头、固定首列。

3. **权限路由拦截守卫 (Route Guard)**
   - 登录后，前端通过调用后端接口 `GET /api/v1/auth/routes` 获取动态路由树，通过 `router.addRoute` 挂载。
   - 所有业务页面通过 `v-hasPermi="['scada:overview']"`（Vue3 示例）或同等指令，对页面内的高危反控按钮、编辑/导出按钮进行隐藏或禁用处理。