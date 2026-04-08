-- ==============================================================
-- MySQL 8.0+ 关系库表结构设计
-- 参考: /.trae/rules/Database_Schema_Design.md
-- ==============================================================

-- 清理旧表以支持重新初始化 (强制同步字段更新)
DROP TABLE IF EXISTS sys_user, sys_role, sys_menu, sys_dept, sys_dict_type, sys_dict_data, sys_user_role, sys_role_menu, sys_audit_log, ast_device, dma_zone, dma_device_rel;

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

-- 4. 设备台账表 (`ast_device`)
CREATE TABLE IF NOT EXISTS ast_device (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(200) NOT NULL,
    device_type SMALLINT NOT NULL COMMENT '字典: 1-水表, 2-阀门, 3-泵, 4-压力计',
    install_date DATE,
    gis_coord VARCHAR(100),
    status SMALLINT DEFAULT 1 COMMENT '状态: 1-在线, 2-离线, 3-维修中',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. DMA 分区表
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

-- 7. 分区与设备关联表
CREATE TABLE IF NOT EXISTS `dma_device_rel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `zone_id` INT NOT NULL COMMENT '分区ID',
  `device_id` INT NOT NULL COMMENT '设备ID',
  `direction` TINYINT(1) DEFAULT 1 COMMENT '1-流入, -1-流出, 0-内部',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='DMA与设备关联表';

-- ----------------------------
-- 10. 设备原始遥测数据表 (Phase 2, 临时替代 TDengine)
-- ----------------------------
DROP TABLE IF EXISTS `device_raw`;
CREATE TABLE `device_raw` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL COMMENT '资产设备ID',
  `tag_name` VARCHAR(100) NOT NULL COMMENT '测点标签名 (如 PLC.S7.Temp)',
  `standard_name` VARCHAR(100) NOT NULL COMMENT '标准化属性名',
  `value` FLOAT NOT NULL COMMENT '处理后的数值',
  `timestamp` BIGINT NOT NULL COMMENT '毫秒级时间戳',
  INDEX `idx_device_time` (`device_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备原始遥测数据表(降级使用)';
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
  `device_id` INT NOT NULL COMMENT '关联的资产设备ID',
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
  CONSTRAINT `fk_tag_gateway` FOREIGN KEY (`gateway_id`) REFERENCES `iot_gateway` (`id`) ON DELETE SET NULL
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

-- 17. 时序库超级表在 MySQL 中的降级模拟表 (用于没有安装 TDengine 时的系统演示不报错)
CREATE TABLE IF NOT EXISTS dma_daily (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ts TIMESTAMP NOT NULL,
    zone_id VARCHAR(30),
    supply DOUBLE,
    sale DOUBLE,
    balance_value DOUBLE,
    night_flow DOUBLE,
    INDEX `idx_dma_daily_ts` (`zone_id`, `ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TDengine dma_daily 降级模拟表';

CREATE TABLE IF NOT EXISTS dma_1h (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ts TIMESTAMP NOT NULL,
    zone_id VARCHAR(30),
    supply DOUBLE,
    sale DOUBLE,
    balance_value DOUBLE,
    night_flow DOUBLE,
    INDEX `idx_dma_1h_ts` (`zone_id`, `ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TDengine dma_1h 降级模拟表';

-- 18. 数据字典类型表
CREATE TABLE IF NOT EXISTS sys_dict_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dict_name VARCHAR(100) NOT NULL COMMENT '字典名称',
    dict_type VARCHAR(100) UNIQUE NOT NULL COMMENT '字典类型(如 sys_user_sex)',
    status SMALLINT DEFAULT 1 COMMENT '状态(1正常 0停用)',
    remark VARCHAR(500) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. 数据字典数据表
CREATE TABLE IF NOT EXISTS sys_dict_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dict_type VARCHAR(100) NOT NULL COMMENT '字典类型',
    dict_label VARCHAR(100) NOT NULL COMMENT '字典标签',
    dict_value VARCHAR(100) NOT NULL COMMENT '字典键值',
    css_class VARCHAR(100) COMMENT '样式属性',
    list_class VARCHAR(100) COMMENT '表格回显样式',
    is_default SMALLINT DEFAULT 0 COMMENT '是否默认(1是 0否)',
    status SMALLINT DEFAULT 1 COMMENT '状态(1正常 0停用)',
    sort_order INT DEFAULT 0 COMMENT '字典排序',
    remark VARCHAR(500) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dict_type) REFERENCES sys_dict_type(dict_type) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- 14. 产销差(NRW)报表
CREATE TABLE IF NOT EXISTS biz_nrw_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id BIGINT NOT NULL,
    report_month VARCHAR(20) NOT NULL COMMENT '月份，如 2026-04',
    supply_m3 DECIMAL(14, 2) NOT NULL,
    consumption_m3 DECIMAL(14, 2) NOT NULL,
    nrw_m3 DECIMAL(14, 2) NOT NULL,
    nrw_ratio DECIMAL(5, 2) NOT NULL COMMENT '产销差率百分比',
    residential_m3 DECIMAL(14, 2) DEFAULT 0 COMMENT '居民用水合法消费',
    industrial_m3 DECIMAL(14, 2) DEFAULT 0 COMMENT '工业用水合法消费',
    commercial_m3 DECIMAL(14, 2) DEFAULT 0 COMMENT '商业用水合法消费',
    apparent_loss_m3 DECIMAL(14, 2) DEFAULT 0 COMMENT '表观漏损 (计量误差/偷水)',
    real_loss_m3 DECIMAL(14, 2) DEFAULT 0 COMMENT '物理漏损 (管网爆管/渗漏)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. 数据清洗与插值规则表
CREATE TABLE IF NOT EXISTS biz_interpolate_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    tag_name VARCHAR(100) NOT NULL,
    method VARCHAR(50) NOT NULL COMMENT '插值算法：linear, pchip, zero, previous',
    max_gap_minutes INT NOT NULL DEFAULT 60 COMMENT '允许插值的最大断点间隙',
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
