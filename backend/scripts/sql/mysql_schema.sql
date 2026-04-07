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

-- 5. 设备台账表
CREATE TABLE IF NOT EXISTS ast_device (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(200) NOT NULL,
    device_type SMALLINT NOT NULL,
    install_date DATE,
    gis_coord VARCHAR(100),
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    is_deleted TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_ast_device_code (device_code)
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
-- 9. 物联网测点标签映射表 (Phase 2)
-- ----------------------------
DROP TABLE IF EXISTS `iot_tag_mapping`;
CREATE TABLE `iot_tag_mapping` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL COMMENT '关联的资产设备ID',
  `tag_name` VARCHAR(100) NOT NULL COMMENT '原始测点标签名 (如 PLC.S7.Temp)',
  `standard_name` VARCHAR(100) NOT NULL COMMENT '标准化属性名 (如 temperature)',
  `data_type` VARCHAR(50) DEFAULT 'float' COMMENT '数据类型',
  `unit` VARCHAR(50) DEFAULT '' COMMENT '单位 (如 °C, MPa)',
  `scaling_factor` FLOAT DEFAULT 1.0 COMMENT '缩放因子',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `remark` VARCHAR(255) DEFAULT '' COMMENT '备注说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tag_device` (`device_id`, `tag_name`)
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
