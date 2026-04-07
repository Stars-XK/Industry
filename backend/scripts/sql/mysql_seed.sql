-- ==============================================================
-- MySQL 测试数据 (Seed)
-- ==============================================================

-- 1. 基础部门
INSERT IGNORE INTO sys_dept (id, parent_id, ancestors, dept_name, sort_order, leader, phone, email, status, remark, created_by) 
VALUES (1, 0, '0', '信创水务集团总部', 1, '张总', '13800138000', 'hq@example.com', 1, '集团最高组织架构', 1);
INSERT IGNORE INTO sys_dept (id, parent_id, ancestors, dept_name, sort_order, leader, phone, email, status, remark, created_by) 
VALUES (2, 1, '0,1', '第一水厂', 1, '李厂长', '13900139000', 'factory1@example.com', 1, '主要生产部门', 1);

-- 2. 管理员账号 (密码: admin123 经过 bcrypt 处理的 hash)
INSERT IGNORE INTO sys_user (id, username, password, nickname, email, phone, gender, avatar, dept_id, status, remark, created_by) 
VALUES (1, 'admin', '$2b$10$kthni4frECVuap.W9tX3teEzKBhYNA3XTBVHbP/0s72f8tTHDR2LO', '超级管理员', 'admin@trae.ai', '18888888888', 1, '', 1, 1, '系统内置超级管理员', 1);

-- 2.1 角色与菜单测试数据
INSERT IGNORE INTO sys_role (id, role_name, role_key, role_sort, data_scope, status, remark, created_by) 
VALUES (1, '超级管理员', 'admin', 1, 1, 1, '拥有所有权限的超级角色', 1);

INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
-- 1. 门户
(1, 0, '统一登录页', 1, '/login', 'login/index', 0, 0, 'sys:login', 'C', 0, 1, 'User', '隐藏的登录页路由', 1),
(2, 0, '数字孪生大屏', 2, '/dashboard', 'dashboard/index', 0, 1, 'sys:dashboard', 'C', 1, 1, 'Odometer', '首页大屏', 1),

-- 2. 综合业务监控台
(10, 0, '综合业务监控台', 10, '/scada', 'Layout', 0, 0, '', 'M', 1, 1, 'Monitor', '', 1),
(11, 10, '全局态势感知', 1, 'overview', 'scada/overview', 0, 0, 'scada:overview', 'C', 1, 1, 'View', '', 1),
(12, 10, '2D拓扑与分区导航', 2, 'topology', 'scada/topology', 0, 0, 'scada:topology', 'C', 1, 1, 'Connection', '', 1),
(13, 10, '工业SCADA工艺组态', 3, 'hmi', 'scada/hmi', 0, 0, 'scada:hmi', 'C', 1, 1, 'Platform', '', 1),
(14, 10, '安防与环境空间监控', 4, 'security', 'scada/security', 0, 0, 'scada:security', 'C', 1, 1, 'Camera', '', 1),

-- 3. 多维统计与数据分析
(20, 0, '多维统计与数据分析', 20, '/analytics', 'Layout', 0, 0, '', 'M', 1, 1, 'DataAnalysis', '', 1),
(21, 20, 'DMA产销差与漏损报表', 1, 'nrw', 'analytics/nrw', 0, 0, 'analytics:nrw', 'C', 1, 1, 'PieChart', '', 1),
(22, 20, '夜间最小流量分析', 2, 'mnf', 'analytics/mnf', 0, 0, 'analytics:mnf', 'C', 1, 1, 'TrendCharts', '', 1),
(23, 20, '大用户档案与重点企业画像', 3, 'key-account', 'analytics/key-account', 0, 0, 'analytics:account', 'C', 1, 1, 'Avatar', '', 1),
(24, 20, '营收计费与出账对账管理', 4, 'billing', 'analytics/billing', 0, 0, 'analytics:billing', 'C', 1, 1, 'Money', '', 1),
(25, 20, '综合能效优化与动态成本核算', 5, 'energy', 'analytics/energy', 0, 0, 'analytics:energy', 'C', 1, 1, 'Lightning', '', 1),
(26, 20, '用量与能耗AI预测分析', 6, 'predict', 'analytics/predict', 0, 0, 'analytics:predict', 'C', 1, 1, 'Cpu', '', 1),
(27, 20, '在线水力模型仿真与推演', 7, 'hydraulic', 'analytics/hydraulic', 0, 0, 'analytics:hydraulic', 'C', 1, 1, 'Opportunity', '', 1),

-- 4. 运维治理与协同闭环
(30, 0, '运维治理与协同闭环', 30, '/workflow', 'Layout', 0, 0, '', 'M', 1, 1, 'Tools', '', 1),
(31, 30, '报警风暴收敛中心', 1, 'alarm', 'workflow/alarm', 0, 0, 'work:alarm', 'C', 1, 1, 'Bell', '', 1),
(32, 30, '工单与巡检全生命周期管理', 2, 'work-order', 'workflow/work-order', 0, 0, 'work:order', 'C', 1, 1, 'Document', '', 1),
(33, 30, 'AI智能调度与协同指挥', 3, 'aigc', 'workflow/aigc', 0, 0, 'work:aigc', 'C', 1, 1, 'Guide', '', 1),
(34, 30, '消息通知与排班调度', 4, 'duty', 'workflow/duty', 0, 0, 'work:duty', 'C', 1, 1, 'Message', '', 1),
(35, 30, '应急预案与SOP数字化管理', 5, 'sop', 'workflow/sop', 0, 0, 'work:sop', 'C', 1, 1, 'Management', '', 1),

-- 5. 数据中台与治理底座
(40, 0, '数据中台与治理底座', 40, '/governance', 'Layout', 0, 0, '', 'M', 1, 1, 'DataBoard', '', 1),
(41, 40, '异构设备与数据源接入', 1, 'integration', 'governance/integration', 0, 0, 'gov:integration', 'C', 1, 1, 'Link', '', 1),
(42, 40, '营收数据融合与清洗配置', 2, 'revenue', 'governance/revenue', 0, 0, 'gov:revenue', 'C', 1, 1, 'Filter', '', 1),
(43, 40, '累积量换算与插值容错规则', 3, 'interpolate', 'governance/interpolate', 0, 0, 'gov:interpolate', 'C', 1, 1, 'Operation', '', 1),
(44, 40, 'SCADA报警联锁与规则引擎配置', 4, 'interlock', 'governance/interlock', 0, 0, 'gov:interlock', 'C', 1, 1, 'Setting', '', 1),
(45, 40, '边缘网关与测点标签管理', 5, 'edge-tag', 'governance/edge-tag', 0, 0, 'gov:edge', 'C', 1, 1, 'Cpu', '', 1),
(46, 40, '工业配方管理', 6, 'recipe', 'governance/recipe', 0, 0, 'gov:recipe', 'C', 1, 1, 'Tickets', '', 1),
(47, 40, '数据清洗与传感器健康度配置', 7, 'sensor', 'governance/sensor', 0, 0, 'gov:sensor', 'C', 1, 1, 'FirstAidKit', '', 1),

-- 6. 系统设置与台账权限
(50, 0, '系统设置与台账权限', 50, '/system', 'Layout', 0, 0, '', 'M', 1, 1, 'Setting', '', 1),
(51, 50, '资产与设备台账', 1, 'asset', 'system/asset', 0, 0, 'sys:asset', 'C', 1, 1, 'Box', '', 1),
(52, 50, '备品备件与仓储管理', 2, 'inventory', 'system/inventory', 0, 0, 'sys:inventory', 'C', 1, 1, 'ShoppingCart', '', 1),
(53, 50, '组织架构与人员管理', 3, 'org', 'system/org', 0, 0, 'sys:org', 'C', 1, 1, 'OfficeBuilding', '', 1),
(54, 50, '角色与权限体系', 4, 'rbac', 'system/rbac', 0, 0, 'sys:rbac', 'C', 1, 1, 'Avatar', '', 1),
(55, 50, '数据字典管理', 5, 'dict', 'system/dict', 0, 0, 'sys:dict', 'C', 1, 1, 'Collection', '', 1),
(56, 50, '安全审计与脱敏日志', 6, 'audit', 'system/audit', 0, 0, 'sys:audit', 'C', 1, 1, 'DocumentChecked', '', 1),
(57, 50, '低代码可视化组态工作台', 7, 'visual-studio', 'system/visual-studio', 0, 0, 'sys:visual', 'C', 1, 1, 'Brush', '', 1);

-- 3. DMA分区测试数据
INSERT IGNORE INTO dma_zone (id, parent_id, zone_name, level, created_by) VALUES (101, 0, '全市供水一级分区', 1, 1);
INSERT IGNORE INTO dma_zone (id, parent_id, zone_name, level, created_by) VALUES (102, 101, '高新工业园区', 2, 1);

-- 4. 设备资产测试数据 (模拟进出水表)
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (201, 'METER_IN_01', '高新区总进水管表', 1, 1);
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (202, 'METER_OUT_01', '高新区工业用水分表', 1, 1);
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (203, 'PRESS_01', '高新区末端管网压力计', 2, 1);

-- 6. 数据字典测试数据
INSERT IGNORE INTO sys_dict_type (id, dict_name, dict_type, remark, created_by) VALUES 
(1, '设备类型', 'sys_device_type', '物联网传感器的枚举类型', 1),
(2, '工单状态', 'wf_order_status', '流程工单的生命周期状态', 1),
(3, '用户性别', 'sys_user_sex', '用户性别列表', 1),
(4, '系统状态', 'sys_normal_disable', '系统开关状态列表', 1),
(5, '显示隐藏', 'sys_show_hide', '菜单是否显示状态', 1),
(6, '菜单类型', 'sys_menu_type', '菜单类型列表', 1),
(7, '数据范围', 'sys_data_scope', '角色数据权限范围', 1),
(8, '系统是否', 'sys_yes_no', '系统是否列表', 1);

INSERT IGNORE INTO sys_dict_data (dict_label, dict_value, dict_type, dict_sort, created_by) VALUES 
('智能水表', '1', 'sys_device_type', 1, 1),
('压力计', '2', 'sys_device_type', 2, 1),
('水泵', '3', 'sys_device_type', 3, 1),
('待接单', '10', 'wf_order_status', 1, 1),
('处理中', '20', 'wf_order_status', 2, 1),
('已闭环', '30', 'wf_order_status', 3, 1),
('未知', '0', 'sys_user_sex', 1, 1),
('男', '1', 'sys_user_sex', 2, 1),
('女', '2', 'sys_user_sex', 3, 1),
('正常', '1', 'sys_normal_disable', 1, 1),
('停用', '0', 'sys_normal_disable', 2, 1),
('显示', '1', 'sys_show_hide', 1, 1),
('隐藏', '0', 'sys_show_hide', 2, 1),
('目录', 'M', 'sys_menu_type', 1, 1),
('菜单', 'C', 'sys_menu_type', 2, 1),
('按钮', 'F', 'sys_menu_type', 3, 1),
('全部数据', '1', 'sys_data_scope', 1, 1),
('本部门及以下', '2', 'sys_data_scope', 2, 1),
('自定义', '3', 'sys_data_scope', 3, 1),
('是', '1', 'sys_yes_no', 1, 1),
('否', '0', 'sys_yes_no', 2, 1);