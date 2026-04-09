-- ==============================================================
-- MySQL 8.0+ 关系库表结构设计
-- 参考: /.trae/rules/Database_Schema_Design.md
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 清理旧表以支持重新初始化 (强制同步字段更新)
DROP TABLE IF EXISTS sys_user, sys_role, sys_menu, sys_dept, sys_dict_type, sys_dict_data, sys_user_role, sys_role_menu, sys_audit_log, sys_config, sys_backup_log, ast_device, ast_site, dma_zone, dma_device_rel, wf_work_order, alm_event, alm_rule, alm_sop, iot_tag_mapping, iot_gateway, biz_tariff, biz_key_account, biz_billing, biz_meter_reading, biz_nrw_report, biz_interpolate_rule, wf_duty_schedule, biz_energy_record, biz_recipe, ast_inventory, ast_inventory_log;

-- 1. 组织架构表
CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT NOT NULL DEFAULT 0 COMMENT '父部门ID',
    ancestors VARCHAR(100) DEFAULT '' COMMENT '祖级列表',
    dept_name VARCHAR(100) NOT NULL COMMENT '部门名称',
    sort_order INT DEFAULT 0 COMMENT '显示顺序',
    leader VARCHAR(20) DEFAULT NULL COMMENT '负责人',
    phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    email VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
    status SMALLINT NOT NULL DEFAULT 1 COMMENT '部门状态（1正常 0停用）',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 2. 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    nickname VARCHAR(30) NOT NULL DEFAULT '' COMMENT '用户昵称',
    email VARCHAR(50) DEFAULT '' COMMENT '用户邮箱',
    phone VARCHAR(20) DEFAULT '' COMMENT '手机号码',
    gender SMALLINT DEFAULT 0 COMMENT '用户性别（0未知 1男 2女）',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像地址',
    dept_id BIGINT DEFAULT NULL COMMENT '部门ID',
    status SMALLINT NOT NULL DEFAULT 1 COMMENT '帐号状态（1正常 0停用 2锁定）',
    last_login_ip VARCHAR(50) DEFAULT '' COMMENT '最后登录IP',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_sys_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

-- 3. 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
    role_key VARCHAR(100) NOT NULL UNIQUE COMMENT '角色权限字符串',
    role_sort INT NOT NULL DEFAULT 0 COMMENT '显示顺序',
    data_scope SMALLINT NOT NULL DEFAULT 2 COMMENT '数据范围（1全部 2本部门 3自定义）',
    status SMALLINT NOT NULL DEFAULT 1 COMMENT '角色状态（1正常 0停用）',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色信息表';

-- 3.1 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT NOT NULL DEFAULT 0 COMMENT '父菜单ID',
    menu_name VARCHAR(100) NOT NULL COMMENT '菜单名称',
    sort_order INT DEFAULT 0 COMMENT '显示顺序',
    path VARCHAR(200) DEFAULT '' COMMENT '路由地址',
    component VARCHAR(255) DEFAULT NULL COMMENT '组件路径',
    is_frame SMALLINT DEFAULT 0 COMMENT '是否为外链（1是 0否）',
    is_cache SMALLINT DEFAULT 0 COMMENT '是否缓存（1缓存 0不缓存）',
    menu_type CHAR(1) NOT NULL DEFAULT 'C' COMMENT '菜单类型（M目录 C菜单 F按钮）',
    visible SMALLINT DEFAULT 1 COMMENT '菜单状态（1显示 0隐藏）',
    status SMALLINT DEFAULT 1 COMMENT '菜单状态（1正常 0停用）',
    perm_code VARCHAR(100) DEFAULT NULL COMMENT '权限标识',
    icon VARCHAR(100) DEFAULT '#' COMMENT '菜单图标',
    remark VARCHAR(500) DEFAULT '' COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单权限表';

-- 3.2 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户和角色关联表';

-- 3.3 角色菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色和菜单关联表';

-- 4. 审计日志表 (全局操作审计)
CREATE TABLE IF NOT EXISTS sys_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    ip_address VARCHAR(50),
    req_method VARCHAR(10),
    req_url VARCHAR(255),
    req_body JSON,
    execution_time INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作审计记录表';

-- 4.1 系统配置表 (sys_config)
CREATE TABLE IF NOT EXISTS sys_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_name VARCHAR(100) NOT NULL COMMENT '配置名称',
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键名',
    config_value TEXT COMMENT '配置键值',
    config_type CHAR(1) DEFAULT 'N' COMMENT '系统内置: Y-是, N-否',
    remark VARCHAR(500) COMMENT '备注说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统参数配置表';

-- 4.2 数据库备份记录表 (sys_backup_log)
CREATE TABLE IF NOT EXISTS sys_backup_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL COMMENT '备份文件名称',
    file_path VARCHAR(500) NOT NULL COMMENT '物理存储路径',
    file_size BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小 (字节)',
    backup_type SMALLINT NOT NULL DEFAULT 1 COMMENT '备份类型: 1-自动定时, 2-手动',
    status SMALLINT NOT NULL DEFAULT 1 COMMENT '状态: 1-成功, 0-失败',
    remark VARCHAR(500) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据库备份记录表';

-- 5. DMA 分区表
CREATE TABLE IF NOT EXISTS dma_zone (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT NOT NULL DEFAULT 0,
    zone_name VARCHAR(100) NOT NULL,
    level SMALLINT NOT NULL DEFAULT 1,
    boundary_gis TEXT,
    mnf_baseline DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 物理站点台账表 (`ast_site`)
CREATE TABLE IF NOT EXISTS ast_site (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_code VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(100) NOT NULL COMMENT '站点名称',
    site_type SMALLINT NOT NULL COMMENT '1-水厂, 2-加压泵站, 3-二供泵房, 4-管网监测点',
    zone_id BIGINT COMMENT '所属DMA分区ID',
    dept_id BIGINT COMMENT '所属归管部门ID',
    address VARCHAR(200) COMMENT '物理地址',
    gis_coord VARCHAR(100) COMMENT 'GIS坐标',
    status SMALLINT DEFAULT 1 COMMENT '1-正常, 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES dma_zone(id) ON DELETE SET NULL,
    FOREIGN KEY (dept_id) REFERENCES sys_dept(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物理站点台账表';

-- 7. 设备台账表 (`ast_device`)
CREATE TABLE IF NOT EXISTS ast_device (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(200) NOT NULL,
    device_type SMALLINT NOT NULL COMMENT '字典: 1-水表, 2-阀门, 3-泵, 4-压力计',
    site_id BIGINT COMMENT '所属站点ID',
    install_date DATE,
    gis_coord VARCHAR(100),
    status SMALLINT DEFAULT 1 COMMENT '状态: 1-在线, 2-离线, 3-维修中',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES ast_site(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.1 分区与设备关联表
CREATE TABLE IF NOT EXISTS `dma_device_rel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `zone_id` BIGINT NOT NULL COMMENT '分区ID',
  `device_id` BIGINT NOT NULL COMMENT '设备ID',
  `direction` TINYINT(1) DEFAULT 1 COMMENT '1-流入, -1-流出, 0-内部',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`zone_id`) REFERENCES `dma_zone`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_id`) REFERENCES `ast_device`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DMA与设备关联表';

-- ----------------------------
DROP TABLE IF EXISTS `iot_gateway`;
CREATE TABLE `iot_gateway` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gateway_sn` VARCHAR(50) NOT NULL UNIQUE COMMENT '网关序列号(SN)',
  `protocol` VARCHAR(50) DEFAULT 'MQTT' COMMENT '通信协议(MQTT, Modbus等)',
  `is_online` TINYINT(1) DEFAULT 0 COMMENT '在线状态: 1-在线 0-离线',
  `cpu_load` FLOAT DEFAULT 0.0 COMMENT 'CPU负载(%)',
  `latency` INT DEFAULT 0 COMMENT '网络延迟(ms)',
  `remark` VARCHAR(255) DEFAULT '' COMMENT '备注说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='边缘网关设备表';

DROP TABLE IF EXISTS `iot_tag_mapping`;
CREATE TABLE `iot_tag_mapping` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` BIGINT NOT NULL COMMENT '关联的资产设备ID',
  `gateway_id` INT DEFAULT NULL COMMENT '关联的边缘网关ID',
  `tag_name` VARCHAR(100) NOT NULL COMMENT '原始测点标签名 (如 PLC.S7.Temp)',
  `plc_address` VARCHAR(100) DEFAULT '' COMMENT 'PLC寄存器地址',
  `standard_name` VARCHAR(100) NOT NULL COMMENT '标准化属性名 (如 temperature)',
  `deadband` FLOAT DEFAULT 0.0 COMMENT '死区过滤阈值',
  `data_type` VARCHAR(50) DEFAULT 'float' COMMENT '数据类型',
  `unit` VARCHAR(50) DEFAULT '' COMMENT '单位 (如 °C, MPa)',
  `scaling_factor` FLOAT DEFAULT 1.0 COMMENT '缩放因子',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `remark` VARCHAR(255) DEFAULT '' COMMENT '备注说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tag_device` (`device_id`, `tag_name`),
  CONSTRAINT `fk_tag_gateway` FOREIGN KEY (`gateway_id`) REFERENCES `iot_gateway` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tag_device` FOREIGN KEY (`device_id`) REFERENCES `ast_device` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物联网测点与标准属性映射表';

-- 8. 字典类型表
CREATE TABLE IF NOT EXISTS sys_dict_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dict_name VARCHAR(100) NOT NULL,
    dict_type VARCHAR(100) NOT NULL UNIQUE,
    status SMALLINT NOT NULL DEFAULT 1,
    remark VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. 字典数据表
CREATE TABLE IF NOT EXISTS sys_dict_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dict_sort INT DEFAULT 0,
    dict_label VARCHAR(100) NOT NULL,
    dict_value VARCHAR(100) NOT NULL,
    dict_type VARCHAR(100) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_sys_dict_data_type (dict_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. 费率配置表
CREATE TABLE IF NOT EXISTS biz_tariff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tariff_code VARCHAR(50) UNIQUE NOT NULL,
    tariff_name VARCHAR(100) NOT NULL,
    price_per_m3 DECIMAL(10, 4) NOT NULL,
    description VARCHAR(255),
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. 抄表底度记录表 (真实的抄表流水)
CREATE TABLE IF NOT EXISTS biz_meter_reading (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    reading_period VARCHAR(20) NOT NULL COMMENT '归属账期 YYYY-MM',
    reading_value DECIMAL(14, 2) NOT NULL COMMENT '当期抄表底数(m3)',
    status SMALLINT DEFAULT 1 COMMENT '1-有效, 0-无效(清洗后)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES biz_key_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================== 运维排班与协同 ======================
CREATE TABLE IF NOT EXISTS wf_duty_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '值班人',
    duty_date DATE NOT NULL COMMENT '值班日期',
    shift_type VARCHAR(20) NOT NULL COMMENT '班次: morning, afternoon, night',
    is_attended SMALLINT DEFAULT 0 COMMENT '0-未打卡, 1-已打卡, 2-缺勤',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
    UNIQUE KEY `uk_duty_date_user` (duty_date, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运维排班表';

-- ====================== 综合能效分析 ======================
CREATE TABLE IF NOT EXISTS biz_energy_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL COMMENT '耗能设备(如泵)',
    record_date DATE NOT NULL COMMENT '能耗记录日期',
    power_kwh DOUBLE NOT NULL COMMENT '日耗电量 (kWh)',
    water_pumped_m3 DOUBLE COMMENT '日泵水量 (m3)',
    energy_efficiency DOUBLE COMMENT '吨水百米能耗指标 (kWh/m3.100m)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES ast_device(id) ON DELETE CASCADE,
    UNIQUE KEY `uk_energy_date_device` (record_date, device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='综合能效与成本核算表';

-- ====================== 数据中台与工业配方 ======================
CREATE TABLE IF NOT EXISTS biz_recipe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_name VARCHAR(100) NOT NULL COMMENT '配方名称',
    process_type VARCHAR(50) NOT NULL COMMENT '工艺类型: DOSE(加药), AERATE(曝气)',
    parameters_json JSON NOT NULL COMMENT '工艺配方参数JSON',
    status SMALLINT DEFAULT 1 COMMENT '1-启用, 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工业工艺配方库表';

-- ====================== 第四阶段: 报警与运维工单 ======================

-- 22. SOP 应急预案库表
CREATE TABLE IF NOT EXISTS alm_sop (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sop_name VARCHAR(100) NOT NULL COMMENT 'SOP 名称',
    alarm_type VARCHAR(50) NOT NULL COMMENT '触发报警类型 (如 H2S_HIGH)',
    steps_json JSON NOT NULL COMMENT '执行步骤 JSON 数组',
    status SMALLINT DEFAULT 1 COMMENT '1-启用, 0-停用',
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SOP 应急预案库';

-- 23. 报警规则/阈值配置表
CREATE TABLE IF NOT EXISTS alm_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称(如：一厂区压力极低报警)',
    device_id BIGINT COMMENT '指定设备(可选，为空则全局)',
    zone_id BIGINT COMMENT '指定分区(可选)',
    tag_name VARCHAR(50) NOT NULL COMMENT '监测指标(如 PRESSURE)',
    condition_type VARCHAR(10) NOT NULL COMMENT '条件: >, <, >=, <=, ==',
    threshold DOUBLE NOT NULL COMMENT '报警阈值',
    alarm_level VARCHAR(10) NOT NULL COMMENT '级别: HH/H/L/LL',
    sop_id BIGINT COMMENT '触发关联的 SOP 预案',
    status SMALLINT DEFAULT 1 COMMENT '1-启用, 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES ast_device(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES dma_zone(id) ON DELETE CASCADE,
    FOREIGN KEY (sop_id) REFERENCES alm_sop(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报警规则判定表';

-- 24. 报警事件表
CREATE TABLE IF NOT EXISTS alm_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL COMMENT '报警关联设备',
    alarm_type VARCHAR(50) NOT NULL COMMENT '报警类型 (如 PRESSURE_LOW)',
    alarm_level VARCHAR(10) NOT NULL COMMENT '报警级别: H/HH/L/LL',
    alarm_value DOUBLE NOT NULL COMMENT '触发时数值',
    alarm_desc VARCHAR(255) COMMENT '报警描述',
    status SMALLINT DEFAULT 0 COMMENT '0-未确认, 1-已确认, 2-已恢复',
    rca_is_root SMALLINT DEFAULT 1 COMMENT 'RCA根因判定: 1-是根因, 0-衍生报警',
    sop_id BIGINT COMMENT '关联触发的SOP',
    recover_time TIMESTAMP NULL COMMENT '恢复时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES ast_device(id) ON DELETE CASCADE,
    FOREIGN KEY (sop_id) REFERENCES alm_sop(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报警事件收敛表';

-- 24. 工单主表
CREATE TABLE IF NOT EXISTS wf_work_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_sn VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    order_type SMALLINT NOT NULL COMMENT '1-巡检, 2-抢修, 3-听漏, 4-保养',
    alarm_id BIGINT COMMENT '关联报警事件',
    device_id BIGINT COMMENT '关联设备',
    title VARCHAR(100) NOT NULL COMMENT '工单标题',
    description TEXT COMMENT '工单描述',
    priority SMALLINT DEFAULT 2 COMMENT '1-低, 2-中, 3-高, 4-紧急',
    status SMALLINT DEFAULT 10 COMMENT '10-待接单, 20-处理中, 30-已闭环, 40-已取消',
    creator_id BIGINT NOT NULL COMMENT '创建人',
    handler_id BIGINT COMMENT '当前处理人',
    gis_coord VARCHAR(100) COMMENT '故障或处理发生坐标(Lng,Lat)',
    result_desc TEXT COMMENT '处理结果说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alarm_id) REFERENCES alm_event(id) ON DELETE SET NULL,
    FOREIGN KEY (device_id) REFERENCES ast_device(id) ON DELETE SET NULL,
    FOREIGN KEY (creator_id) REFERENCES sys_user(id),
    FOREIGN KEY (handler_id) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运维工单主表';

-- 11. 大用户档案表
CREATE TABLE IF NOT EXISTS biz_key_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_no VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    phone VARCHAR(20),
    address VARCHAR(200),
    industry_type VARCHAR(50),
    tariff_id BIGINT,
    meter_device_id BIGINT COMMENT '关联的水表资产ID',
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tariff_id) REFERENCES biz_tariff(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. 营收账单表
CREATE TABLE IF NOT EXISTS biz_billing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    billing_period VARCHAR(20) NOT NULL COMMENT '账期，如 2026-04',
    usage_m3 DECIMAL(14, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' COMMENT 'unpaid, paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES biz_key_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. 夜间最小流量(MNF)分析表
CREATE TABLE IF NOT EXISTS biz_mnf_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT NOT NULL,
    analysis_date DATE NOT NULL,
    mnf_value DECIMAL(10, 2) NOT NULL,
    baseline_value DECIMAL(10, 2) NOT NULL,
    anomaly_score DECIMAL(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'normal' COMMENT 'normal, anomaly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. 产销差(NRW)统计报表
CREATE TABLE IF NOT EXISTS biz_nrw_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT NOT NULL COMMENT '分析层级(如整个厂区或某DMA)',
    report_month VARCHAR(10) NOT NULL COMMENT '报表月份(YYYY-MM)',
    total_supply_m3 DOUBLE NOT NULL DEFAULT 0 COMMENT '当月总供水量',
    total_sales_m3 DOUBLE NOT NULL DEFAULT 0 COMMENT '当月总售水量',
    real_loss_m3 DOUBLE NOT NULL DEFAULT 0 COMMENT '真实漏损量(物理漏损)',
    apparent_loss_m3 DOUBLE NOT NULL DEFAULT 0 COMMENT '表观漏损量(计量误差+偷水)',
    nrw_ratio DOUBLE NOT NULL DEFAULT 0 COMMENT '产销差率(%)',
    evaluated_by BIGINT COMMENT '评估人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES dma_zone(id),
    FOREIGN KEY (evaluated_by) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. 数据清洗与插值规则表
CREATE TABLE IF NOT EXISTS biz_interpolate_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    method VARCHAR(50) NOT NULL COMMENT '插值算法：linear, pchip, zero, previous',
    max_gap_minutes INT NOT NULL DEFAULT 60 COMMENT '允许插值的最大断点间隙',
    status SMALLINT DEFAULT 1 COMMENT '1-启用 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES ast_device(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- 25. 备品备件库存表
CREATE TABLE IF NOT EXISTS ast_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL COMMENT '备件名称',
    part_code VARCHAR(50) UNIQUE NOT NULL COMMENT '备件编码',
    category VARCHAR(50) COMMENT '分类: valve, meter, chemical, other',
    specification VARCHAR(100) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    stock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '当前库存数量',
    safe_stock DECIMAL(10,2) DEFAULT 0 COMMENT '安全库存预警线',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价(成本核算用)',
    location VARCHAR(100) COMMENT '仓库位置',
    status SMALLINT DEFAULT 1 COMMENT '1-正常, 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='备品备件库存表';

-- 26. 库存出入库流水表
CREATE TABLE IF NOT EXISTS ast_inventory_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL COMMENT '备件ID',
    order_id BIGINT COMMENT '关联工单ID(出库用)',
    change_type SMALLINT NOT NULL COMMENT '1-入库, -1-出库, 0-盘点修正',
    quantity DECIMAL(10,2) NOT NULL COMMENT '变动数量',
    after_stock DECIMAL(10,2) NOT NULL COMMENT '变动后库存',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES ast_inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES wf_work_order(id) ON DELETE SET NULL,
    FOREIGN KEY (operator_id) REFERENCES sys_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存出入库流水表';

SET FOREIGN_KEY_CHECKS = 1;

-- 31. 运维排班表
CREATE TABLE IF NOT EXISTS wf_duty_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    duty_date DATE NOT NULL,
    shift_type VARCHAR(20) NOT NULL COMMENT 'day: 白班, night: 夜班',
    location_lng VARCHAR(20) DEFAULT NULL,
    location_lat VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运维排班与定位表';

-- 32. 综合能效分析表
CREATE TABLE IF NOT EXISTS biz_energy_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    water_supply DOUBLE DEFAULT 0 COMMENT '供水量',
    power_consume DOUBLE DEFAULT 0 COMMENT '耗电量',
    gas_consume DOUBLE DEFAULT 0 COMMENT '耗气量',
    ton_water_power DOUBLE DEFAULT 0 COMMENT '吨水百米能耗',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='综合能效分析记录表';

-- 33. 工业工艺配方库表
CREATE TABLE IF NOT EXISTS biz_recipe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_code VARCHAR(50) NOT NULL UNIQUE,
    recipe_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    target_flow DOUBLE DEFAULT 0,
    pac_ratio DOUBLE DEFAULT 0 COMMENT 'PAC 加药比例',
    pam_ratio DOUBLE DEFAULT 0 COMMENT 'PAM 加药比例',
    mix_time INT DEFAULT 0 COMMENT '搅拌时间(秒)',
    status SMALLINT DEFAULT 1 COMMENT '1-启用 0-停用',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES sys_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工业工艺配方库表';

-- ----------------------------
-- 15. 多源异构数据源接入配置表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `gov_datasource_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '唯一标识',
  `source_name` varchar(100) NOT NULL COMMENT '数据源名称',
  `source_type` varchar(50) NOT NULL COMMENT '类型: http, kafka, mysql, pg, oracle, dm',
  `connection_config` text COMMENT '连接配置(JSON格式)',
  `cron_expression` varchar(50) DEFAULT NULL COMMENT '定时采集表达式',
  `status` smallint(6) NOT NULL DEFAULT '1' COMMENT '状态: 1-启用, 0-停用',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` bigint(20) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='多源异构数据源接入配置表';
