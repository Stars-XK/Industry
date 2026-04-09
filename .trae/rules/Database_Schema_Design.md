# 信创工业综合治理平台 - 数据库表结构设计规范 (Database Schema Design)

本文档基于《需求文档(PRD)》与《前端菜单与页面功能设计规范》，定义系统底层的数据存储模型。

## 1. 数据库选型与架构分离原则

为支撑“百亿级高并发时序数据”与“复杂业务逻辑”的并行处理，系统采用**冷热分离、结构异构**的双数据库底座架构：
1. **关系型业务数据库 (MySQL 8.0+)**：存储台账、组织架构、RBAC权限、工单、组态元数据及设备标签映射关系（即所有的静态/低频更新数据）。选用 MySQL 是为了更方便的迁移和普及性。
2. **时序数据库 (TDengine 3.3.8+)**：专职存储水务、电力、环境等传感器的秒级/毫秒级历史时序数据（动态数据），并利用其流计算引擎进行降采样聚合。

---

## 2. 核心业务域 MySQL 详细表结构设计

*注：所有表默认包含审计字段：`created_by`, `created_at`, `updated_by`, `updated_at`, `is_deleted`，以下表格中省略展示以求精简。*

### 2.1 系统权限与组织架构 (RBAC & Org)

**1. 用户表 (`sys_user`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 (Snowflake) |
| `username` | VARCHAR | 50 | N | - | 登录账号 |
| `password` | VARCHAR | 255 | N | - | 密码 Hash (Bcrypt) |
| `nickname` | VARCHAR | 30 | N | '' | 用户昵称 |
| `email` | VARCHAR | 50 | Y | '' | 用户邮箱 |
| `phone` | VARCHAR | 20 | Y | '' | 手机号码 |
| `gender` | SMALLINT | - | Y | 0 | 性别: 0-未知, 1-男, 2-女 |
| `avatar` | VARCHAR | 255 | Y | '' | 头像地址 |
| `dept_id` | BIGINT | - | Y | NULL | 所属部门 ID |
| `status` | SMALLINT | - | N | 1 | 状态: 1-正常, 0-停用, 2-锁定 |
| `last_login_ip` | VARCHAR | 50 | Y | '' | 最后登录IP |
| `last_login_time` | DATETIME | - | Y | NULL | 最后登录时间 |
| `remark` | VARCHAR | 500 | Y | NULL | 备注 |

**2. 角色表 (`sys_role`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `role_name` | VARCHAR | 100 | N | - | 角色名称 (如：厂长、维修工) |
| `role_key` | VARCHAR | 100 | N | - | 角色标识 (如：`admin`, `worker`) |
| `role_sort` | INT | - | N | 0 | 显示顺序 |
| `data_scope` | SMALLINT | - | N | 2 | 数据范围: 1-全部, 2-本部门, 3-自定义 |
| `status` | SMALLINT | - | N | 1 | 角色状态: 1-正常, 0-停用 |
| `remark` | VARCHAR | 500 | Y | NULL | 备注 |

**3. 菜单与权限表 (`sys_menu`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `parent_id` | BIGINT | - | N | 0 | 父菜单 ID |
| `menu_name` | VARCHAR | 100 | N | - | 菜单或按钮名称 |
| `sort_order` | INT | - | Y | 0 | 显示顺序 |
| `path` | VARCHAR | 200 | Y | '' | 路由地址 |
| `component` | VARCHAR | 255 | Y | NULL | 组件路径 |
| `is_frame` | SMALLINT | - | Y | 0 | 是否外链: 1-是, 0-否 |
| `is_cache` | SMALLINT | - | Y | 0 | 是否缓存: 1-是, 0-否 |
| `menu_type` | CHAR | 1 | N | 'C' | 类型: M-目录, C-菜单, F-按钮 |
| `visible` | SMALLINT | - | Y | 1 | 显示状态: 1-显示, 0-隐藏 |
| `status` | SMALLINT | - | Y | 1 | 菜单状态: 1-正常, 0-停用 |
| `perm_code` | VARCHAR | 100 | Y | NULL | 权限标识 |
| `icon` | VARCHAR | 100 | Y | '#' | 菜单图标 |
| `remark` | VARCHAR | 500 | Y | '' | 备注 |

**3.1 系统配置表 (`sys_config`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `config_name` | VARCHAR | 100 | N | - | 配置名称 (如：系统标题、地图来源) |
| `config_key` | VARCHAR | 100 | N | - | 配置键名 (如：`sys.site.title`, `sys.map.source`) |
| `config_value`| TEXT | - | Y | '' | 配置键值 |
| `config_type` | CHAR | 1 | Y | 'N' | 系统内置: Y-是, N-否 |
| `remark` | VARCHAR | 500 | Y | NULL | 备注说明 |

**3.2 数据库备份记录表 (`sys_backup_log`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `file_name` | VARCHAR | 255 | N | - | 备份文件名称 (如 `backup_20260409_0800.sql.gz`) |
| `file_path` | VARCHAR | 500 | N | - | 物理存储路径 |
| `file_size` | BIGINT | - | N | 0 | 文件大小 (字节) |
| `backup_type` | SMALLINT | - | N | 1 | 备份类型: 1-自动定时, 2-手动(如向导导入前) |
| `status` | SMALLINT | - | N | 1 | 状态: 1-成功, 0-失败 |
| `remark` | VARCHAR | 500 | Y | NULL | 备注 (可记录失败原因) |

### 2.2 资产、设备与物联网网关元数据 (Assets & IoT)

**4. 设备台账表 (`ast_device`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `device_code` | VARCHAR | 50 | N | - | 设备唯一编码 (关联 TDengine `device_id`) |
| `device_name` | VARCHAR | 200 | N | - | 设备名称 |
| `device_type` | SMALLINT | - | N | - | 字典: 1-水表, 2-阀门, 3-泵, 4-压力计 |
| `install_date` | DATE | - | Y | - | 安装日期 |
| `gis_coord` | VARCHAR | 100 | Y | - | GIS 坐标 (Lng, Lat, Alt) |
| `status` | SMALLINT | - | N | 1 | 状态: 1-在线, 2-离线, 3-维修中 |

**5. 网关表 (`iot_gateway`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `gateway_sn` | VARCHAR | 100 | N | - | 网关 MAC 或 SN 码 |
| `protocol` | VARCHAR | 50 | N | 'MQTT' | 接入协议: MQTT/Modbus/OPC |
| `is_online` | SMALLINT | - | N | 0 | 在线状态: 1-在线, 0-离线 |

**6. 测点与时序标签映射表 (`iot_tag_mapping`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `device_id` | BIGINT | - | N | - | 关联设备 ID |
| `gateway_id`| BIGINT | - | Y | - | 关联网关 ID |
| `plc_address`| VARCHAR | 100 | Y | - | 底层寄存器地址 (如 `40001`) |
| `ts_tag_name`| VARCHAR | 100 | N | - | 时序库全局标签 (如 `PUMP_01_PRESS`) |
| `deadband` | DECIMAL | 10,4 | Y | 0 | 死区/毛刺过滤阈值 |

### 2.3 拓扑与 DMA 分区 (Topology & DMA)

**7. 分区表 (`dma_zone`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 (关联 TDengine `zone_id`) |
| `parent_id` | BIGINT | - | N | 0 | 父级分区 |
| `zone_name` | VARCHAR | 100 | N | - | 分区名称 (如：一厂区、A车间) |
| `level` | SMALLINT | - | N | 1 | 层级 (1级, 2级, 3级) |
| `boundary_gis`| TEXT | - | Y | - | GIS面状边界 (GeoJSON Polygon) |
| `mnf_baseline`| DECIMAL | 10,2 | Y | 0 | 夜间最小流量基线 (AI写入) |

**8. 分区设备关联表 (`dma_device_rel`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `zone_id` | BIGINT | - | N | - | 分区 ID |
| `device_id` | BIGINT | - | N | - | 设备 ID |
| `in_out_type`| SMALLINT | - | N | 0 | 1:进水分表, -1:出水分表, 0:内部分表 |

### 2.4 工单与应急协同 (Workflow & SOP)

**9. 工单主表 (`wf_work_order`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `order_sn` | VARCHAR | 50 | N | - | 工单编号 (按规则生成) |
| `order_type`| SMALLINT | - | N | - | 类型: 1-巡检, 2-抢修, 3-听漏, 4-冲销 |
| `handler_id`| BIGINT | - | Y | - | 当前处理人 ID |
| `status` | SMALLINT | - | N | 10 | 状态: 10-待接单, 20-处理中, 30-已闭环 |
| `gis_coord` | VARCHAR | 100 | Y | - | 故障或处理发生坐标 |

**10. 报警事件表 (`alm_event`)**
| 字段名 | 类型 | 长度 | 允许空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `id` | BIGINT | - | N | 主键 | 唯一标识 |
| `device_id` | BIGINT | - | N | - | 报警设备 |
| `alarm_level`| VARCHAR | 10 | N | - | 级别: H/HH/L/LL |
| `rca_is_root`| SMALLINT | - | N | 1 | RCA根因判定: 1-是根因, 0-衍生报警 |
| `recover_time`| TIMESTAMP| - | Y | - | 报警恢复时间 |

---

## 3. 时序数据库与流计算架构 (工业级降本增效)

由于工业现场的物联网设备数据（`device_raw`）可能达到百亿级，传统的“Node.js 业务服务在内存中执行 SUM/AVG 聚合”将导致严重的 CPU 满载与 OOM (内存溢出) 宕机。

本系统严格遵守**“计算下推”**架构原则：
1. **TDengine 负责重度计算 (流计算 Stream Computing)**：
   - 原始数据接入 `device_raw` 后，由 TDengine 内部的 `CQ` (Continuous Queries) 和流计算引擎，持续不断地生成 5 分钟级 (`device_5m`, `dma_5m`)、小时级 (`dma_1h`)、以及日级 (`dma_daily`) 的预聚合超级表。
   - 即使业务层（Node.js 服务）宕机或升级，底层的时序库仍会利用 `WATERMARK` 和 `MAX_DELAY` 机制，保证数据计算的连续性和防乱序能力。
2. **Node.js (NestJS) 仅作为调度与查询中心**：
   - 严禁在 Node.js 中执行 `SELECT SUM(value) FROM device_raw GROUP BY timestamp`。
   - 所有的报表、趋势图必须**直接读取 TDengine 已经算好的结果集（如 `dma_1h`, `dma_daily`）**，确保 API 接口耗时在毫秒级 (`<10ms`)。
   - 对于复杂的数据清洗与断点插值规则，Node.js 负责从 MySQL 读取配置策略（如 PCHIP、Linear），随后生成对应的 TDengine `INTERP` 与 `FILL` SQL 语句，**下发给时序数据库执行底层计算作业**。

针对高频监控数据，采用 **“超级表 (Super Table) + 子表 (Sub Table)”** 模型，并使用 **流计算 (Stream Computing)** 进行多级降采样聚合。
所有关系维度通过 **Tag** (如 `device_id`, `zone_id`) 映射。

### 3.1 超级表 (Super Table) 详细设计

**1. 基础设备原始数据表 (`device_raw`)**
记录传感器秒级或毫秒级最原始上报值。
| 字段名 | 类型 | 说明 | Tag/Column |
|---|---|---|---|
| `ts` | TIMESTAMP | 数据时间戳 | Column (主键) |
| `raw_value` | DOUBLE | 采集原始值 | Column |
| `device_id` | VARCHAR(50) | 关联设备唯一编码 | Tag |
| `zone_id` | VARCHAR(30) | 所属 DMA 分区 ID | Tag |
| `device_type` | TINYINT | 设备类型 (1:水表, 2:压力, 3:电表) | Tag |

**2. 设备 5 分钟聚合表 (`device_5m`)**
经流计算降采样，剔除毛刺，统一时间轴。
| 字段名 | 类型 | 说明 | Tag/Column |
|---|---|---|---|
| `ts` | TIMESTAMP | 时间切片起点 | Column (主键) |
| `raw_value` | DOUBLE | 5分钟内的平均值/累计差值 | Column |
| `qcode` | TINYINT | 数据质量码 (0:正常, 1:插值, 2:超限) | Column |
| `device_id` | VARCHAR(50) | - | Tag |
| `zone_id` | VARCHAR(30) | - | Tag |
| `device_type` | TINYINT | - | Tag |

**3. DMA 5 分钟供售水汇聚表 (`dma_5m`)**
针对分区进行汇总计算，支持产销差实时监控。
| 字段名 | 类型 | 说明 | Tag/Column |
|---|---|---|---|
| `ts` | TIMESTAMP | 时间切片起点 | Column (主键) |
| `supply` | DOUBLE | 分区 5 分钟总供水 (进水表 - 出水表) | Column |
| `sale` | DOUBLE | 分区 5 分钟总售水 (内部营收表汇总) | Column |
| `balance_value`| DOUBLE | 5 分钟平衡值 (供 - 售) | Column |
| `night_flow` | DOUBLE | 夜间流量标记 (非夜间段为 0) | Column |
| `zone_id` | VARCHAR(30) | DMA 分区 ID | Tag |

**4. DMA 日/月/年聚合表 (`dma_daily`, `dma_monthly`, `dma_yearly`)**
报表专属查询表，字段同 `dma_5m`。

### 3.2 核心流计算 (Stream Computing) 建表脚本

**示例 1：设备 5 分钟均值降采样 (压力/水质等)**
```sql
CREATE STREAM IF NOT EXISTS stream_device_5m
INTERVAL(5m) SLIDING(5m) FROM device_raw
PARTITION BY device_id, zone_id, device_type
STREAM_OPTIONS(WATERMARK(10s) | MAX_DELAY(5s) | IGNORE_DISORDER)
INTO device_5m
AS SELECT
  _wstart AS ts,
  AVG(raw_value) AS raw_value,
  CAST(0 AS TINYINT) AS qcode
FROM device_raw
PARTITION BY device_id, zone_id, device_type
INTERVAL(5m);
```

**示例 2：DMA 每日夜间最小流量 (MNF: 凌晨 2-4 点) 提取**
```sql
CREATE STREAM IF NOT EXISTS stream_dma_night
INTERVAL(1d) SLIDING(1d) FROM dma_5m
PARTITION BY zone_id
STREAM_OPTIONS(WATERMARK(1m) | MAX_DELAY(2m) | IGNORE_DISORDER)
INTO dma_daily
AS SELECT
  _wstart AS ts,
  CAST(0 AS DOUBLE) AS supply,
  CAST(0 AS DOUBLE) AS sale,
  CAST(0 AS DOUBLE) AS balance_value,
  MIN(supply) AS night_flow
FROM (
    SELECT supply, ts, zone_id
    FROM dma_5m
    -- 过滤出 02:00 到 04:00 的时间段
    WHERE CAST(ts AS BIGINT) % 86400000 >= 7200000 AND CAST(ts AS BIGINT) % 86400000 < 14400000
)
PARTITION BY zone_id
INTERVAL(1d);
```

**示例 3：DMA 产销差日平衡值流计算**
由于供水和售水数据来自不同的基础表流（`device_5m` vs `user_daily`），我们在业务层通过对 `dma_daily` 进行汇总聚合来计算最终的产销差。
```sql
SELECT ts, 
       SUM(supply) as supply, 
       SUM(sale) as sale, 
       SUM(supply) - SUM(sale) as balance_value 
FROM dma_daily 
GROUP BY ts, zone_id;
```

---

## 4. 核心安全与审计策略
1. **密码存储**：`sys_user.password` 强制采用 `Bcrypt` 加密，加盐 (Salt) 处理。
2. **脱敏存储**：敏感个人信息采用 AES-256 对称加密存入数据库，仅在拥有 `sys:audit:view_mask` 权限时解密。
3. **全局操作审计 (`sys_audit_log`)**：记录 `req_url`, `req_method`, `user_id`, `ip_address`, `before_data_json`, `after_data_json`，核心业务表（如配方、费率）的修改将自动保存 JSON Diff 以供防篡改追溯。