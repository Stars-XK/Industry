-- ==============================================================
-- PostgreSQL 14+ 关系库表结构设计
-- 参考: /.trae/rules/Database_Schema_Design.md
-- ==============================================================

-- 1. 组织架构表
CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL DEFAULT 0,
    dept_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    dept_id BIGINT NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 角色表
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_key VARCHAR(100) NOT NULL UNIQUE,
    data_scope SMALLINT NOT NULL DEFAULT 2
);

-- 3.1 菜单表
CREATE TABLE IF NOT EXISTS sys_menu (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL DEFAULT 0,
    menu_name VARCHAR(100) NOT NULL,
    path VARCHAR(200),
    component VARCHAR(255),
    perm_code VARCHAR(100),
    menu_type CHAR(1) NOT NULL DEFAULT 'C'
);

-- 4. 设备台账表
CREATE TABLE IF NOT EXISTS ast_device (
    id BIGSERIAL PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(200) NOT NULL,
    device_type SMALLINT NOT NULL,
    install_date DATE,
    gis_coord VARCHAR(100),
    status SMALLINT NOT NULL DEFAULT 1
);

-- 5. DMA 分区表
CREATE TABLE IF NOT EXISTS dma_zone (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT NOT NULL DEFAULT 0,
    zone_name VARCHAR(100) NOT NULL,
    level SMALLINT NOT NULL DEFAULT 1,
    boundary_gis TEXT,
    mnf_baseline DECIMAL(10,2) DEFAULT 0
);

-- 6. 分区与设备关联表
CREATE TABLE IF NOT EXISTS dma_device_rel (
    id BIGSERIAL PRIMARY KEY,
    zone_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    in_out_type SMALLINT NOT NULL DEFAULT 0
);

-- 7. 字典类型表
CREATE TABLE IF NOT EXISTS sys_dict_type (
    id BIGSERIAL PRIMARY KEY,
    dict_name VARCHAR(100) NOT NULL,
    dict_type VARCHAR(100) NOT NULL UNIQUE,
    status SMALLINT NOT NULL DEFAULT 1,
    remark VARCHAR(500)
);

-- 8. 字典数据表
CREATE TABLE IF NOT EXISTS sys_dict_data (
    id BIGSERIAL PRIMARY KEY,
    dict_sort INT DEFAULT 0,
    dict_label VARCHAR(100) NOT NULL,
    dict_value VARCHAR(100) NOT NULL,
    dict_type VARCHAR(100) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_sys_user_username ON sys_user(username);
CREATE INDEX IF NOT EXISTS idx_ast_device_code ON ast_device(device_code);
CREATE INDEX IF NOT EXISTS idx_dma_device_rel_zone ON dma_device_rel(zone_id);
CREATE INDEX IF NOT EXISTS idx_sys_dict_data_type ON sys_dict_data(dict_type);
