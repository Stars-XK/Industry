-- ==============================================================
-- PostgreSQL 测试数据 (Seed)
-- ==============================================================

-- 1. 基础部门
INSERT INTO sys_dept (id, parent_id, dept_name) VALUES (1, 0, '信创水务集团总部') ON CONFLICT DO NOTHING;
INSERT INTO sys_dept (id, parent_id, dept_name) VALUES (2, 1, '第一水厂') ON CONFLICT DO NOTHING;

-- 2. 管理员账号 (密码: admin123 经过 bcrypt 处理的假 hash)
INSERT INTO sys_user (id, username, password, dept_id, status) 
VALUES (1, 'admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjQGjYp2Xm', 1, 1) 
ON CONFLICT (username) DO NOTHING;

-- 2.1 角色与菜单测试数据
INSERT INTO sys_role (id, role_name, role_key, data_scope) VALUES (1, '超级管理员', 'admin', 1) ON CONFLICT DO NOTHING;
INSERT INTO sys_menu (id, parent_id, menu_name, path, component, perm_code, menu_type) VALUES
(1, 0, '数字孪生大屏', '/dashboard', 'dashboard/index', 'sys:dashboard', 'C'),
(2, 0, '综合业务监控台', '/scada', 'Layout', '', 'M'),
(3, 2, '全局态势感知', 'overview', 'scada/overview', 'scada:overview', 'C'),
(4, 2, '2D拓扑与分区', 'topology', 'scada/topology', 'scada:topology', 'C')
ON CONFLICT DO NOTHING;

-- 3. DMA分区测试数据
INSERT INTO dma_zone (id, parent_id, zone_name, level) VALUES (101, 0, '全市供水一级分区', 1) ON CONFLICT DO NOTHING;
INSERT INTO dma_zone (id, parent_id, zone_name, level) VALUES (102, 101, '高新工业园区', 2) ON CONFLICT DO NOTHING;

-- 4. 设备资产测试数据 (模拟进出水表)
INSERT INTO ast_device (id, device_code, device_name, device_type) VALUES (201, 'METER_IN_01', '高新区总进水管表', 1) ON CONFLICT (device_code) DO NOTHING;
INSERT INTO ast_device (id, device_code, device_name, device_type) VALUES (202, 'METER_OUT_01', '高新区工业用水分表', 1) ON CONFLICT (device_code) DO NOTHING;
INSERT INTO ast_device (id, device_code, device_name, device_type) VALUES (203, 'PRESS_01', '高新区末端管网压力计', 2) ON CONFLICT (device_code) DO NOTHING;

-- 5. 分区设备绑定关系
-- 进水表 (in_out_type = 1)
INSERT INTO dma_device_rel (zone_id, device_id, in_out_type) VALUES (102, 201, 1) ON CONFLICT DO NOTHING;
-- 出水表 (in_out_type = -1)
INSERT INTO dma_device_rel (zone_id, device_id, in_out_type) VALUES (102, 202, -1) ON CONFLICT DO NOTHING;
-- 内部监控表 (in_out_type = 0)
INSERT INTO dma_device_rel (zone_id, device_id, in_out_type) VALUES (102, 203, 0) ON CONFLICT DO NOTHING;
