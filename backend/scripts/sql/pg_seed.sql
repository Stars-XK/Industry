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
-- 1. 门户
(1, 0, '统一登录页', '/login', 'login/index', 'sys:login', 'C'),
(2, 0, '数字孪生大屏', '/dashboard', 'dashboard/index', 'sys:dashboard', 'C'),

-- 2. 综合业务监控台
(10, 0, '综合业务监控台', '/scada', 'Layout', '', 'M'),
(11, 10, '全局态势感知', 'overview', 'scada/overview', 'scada:overview', 'C'),
(12, 10, '2D拓扑与分区导航', 'topology', 'scada/topology', 'scada:topology', 'C'),
(13, 10, '工业SCADA工艺组态', 'hmi', 'scada/hmi', 'scada:hmi', 'C'),
(14, 10, '安防与环境空间监控', 'security', 'scada/security', 'scada:security', 'C'),

-- 3. 多维统计与数据分析
(20, 0, '多维统计与数据分析', '/analytics', 'Layout', '', 'M'),
(21, 20, 'DMA产销差与漏损报表', 'nrw', 'analytics/nrw', 'analytics:nrw', 'C'),
(22, 20, '夜间最小流量分析', 'mnf', 'analytics/mnf', 'analytics:mnf', 'C'),
(23, 20, '大用户档案与重点企业画像', 'key-account', 'analytics/key-account', 'analytics:account', 'C'),
(24, 20, '营收计费与出账对账管理', 'billing', 'analytics/billing', 'analytics:billing', 'C'),
(25, 20, '综合能效优化与动态成本核算', 'energy', 'analytics/energy', 'analytics:energy', 'C'),
(26, 20, '用量与能耗AI预测分析', 'predict', 'analytics/predict', 'analytics:predict', 'C'),
(27, 20, '在线水力模型仿真与推演', 'hydraulic', 'analytics/hydraulic', 'analytics:hydraulic', 'C'),

-- 4. 运维治理与协同闭环
(30, 0, '运维治理与协同闭环', '/workflow', 'Layout', '', 'M'),
(31, 30, '报警风暴收敛中心', 'alarm', 'workflow/alarm', 'work:alarm', 'C'),
(32, 30, '工单与巡检全生命周期管理', 'work-order', 'workflow/work-order', 'work:order', 'C'),
(33, 30, 'AI智能调度与协同指挥', 'aigc', 'workflow/aigc', 'work:aigc', 'C'),
(34, 30, '消息通知与排班调度', 'duty', 'workflow/duty', 'work:duty', 'C'),
(35, 30, '应急预案与SOP数字化管理', 'sop', 'workflow/sop', 'work:sop', 'C'),

-- 5. 数据中台与治理底座
(40, 0, '数据中台与治理底座', '/governance', 'Layout', '', 'M'),
(41, 40, '异构设备与数据源接入', 'integration', 'governance/integration', 'gov:integration', 'C'),
(42, 40, '营收数据融合与清洗配置', 'revenue', 'governance/revenue', 'gov:revenue', 'C'),
(43, 40, '累积量换算与插值容错规则', 'interpolate', 'governance/interpolate', 'gov:interpolate', 'C'),
(44, 40, 'SCADA报警联锁与规则引擎配置', 'interlock', 'governance/interlock', 'gov:interlock', 'C'),
(45, 40, '边缘网关与测点标签管理', 'edge-tag', 'governance/edge-tag', 'gov:edge', 'C'),
(46, 40, '工业配方管理', 'recipe', 'governance/recipe', 'gov:recipe', 'C'),
(47, 40, '数据清洗与传感器健康度配置', 'sensor', 'governance/sensor', 'gov:sensor', 'C'),

-- 6. 系统设置与台账权限
(50, 0, '系统设置与台账权限', '/system', 'Layout', '', 'M'),
(51, 50, '资产与设备台账', 'asset', 'system/asset', 'sys:asset', 'C'),
(52, 50, '备品备件与仓储管理', 'inventory', 'system/inventory', 'sys:inventory', 'C'),
(53, 50, '组织架构与人员管理', 'org', 'system/org', 'sys:org', 'C'),
(54, 50, '角色与权限体系', 'rbac', 'system/rbac', 'sys:rbac', 'C'),
(55, 50, '数据字典管理', 'dict', 'system/dict', 'sys:dict', 'C'),
(56, 50, '安全审计与脱敏日志', 'audit', 'system/audit', 'sys:audit', 'C'),
(57, 50, '低代码可视化组态工作台', 'visual-studio', 'system/visual-studio', 'sys:visual', 'C')
ON CONFLICT DO NOTHING;

-- 3. DMA分区测试数据
INSERT INTO dma_zone (id, parent_id, zone_name, level) VALUES (101, 0, '全市供水一级分区', 1) ON CONFLICT DO NOTHING;
INSERT INTO dma_zone (id, parent_id, zone_name, level) VALUES (102, 101, '高新工业园区', 2) ON CONFLICT DO NOTHING;

-- 4. 设备资产测试数据 (模拟进出水表)
INSERT INTO ast_device (id, device_code, device_name, device_type) VALUES (201, 'METER_IN_01', '高新区总进水管表', 1) ON CONFLICT (device_code) DO NOTHING;
INSERT INTO ast_device (id, device_code, device_name, device_type) VALUES (202, 'METER_OUT_01', '高新区工业用水分表', 1) ON CONFLICT (device_code) DO NOTHING;
INSERT INTO ast_device (id, device_code, device_name, device_type) VALUES (203, 'PRESS_01', '高新区末端管网压力计', 2) ON CONFLICT (device_code) DO NOTHING;

-- 6. 数据字典测试数据
INSERT INTO sys_dict_type (id, dict_name, dict_type, remark) VALUES 
(1, '设备类型', 'sys_device_type', '物联网传感器的枚举类型'),
(2, '工单状态', 'wf_order_status', '流程工单的生命周期状态')
ON CONFLICT DO NOTHING;

INSERT INTO sys_dict_data (dict_label, dict_value, dict_type, dict_sort) VALUES 
('智能水表', '1', 'sys_device_type', 1),
('压力计', '2', 'sys_device_type', 2),
('水泵', '3', 'sys_device_type', 3),
('待接单', '10', 'wf_order_status', 1),
('处理中', '20', 'wf_order_status', 2),
('已闭环', '30', 'wf_order_status', 3);
