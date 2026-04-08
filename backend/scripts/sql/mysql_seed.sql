-- ==============================================================
-- MySQL 测试数据 (Seed)
-- ==============================================================

-- 1. 基础部门
INSERT IGNORE INTO sys_dept (id, parent_id, ancestors, dept_name, sort_order, leader, phone, email, status, remark, created_by) VALUES
(1, 0, '0', '上海城投水务集团', 1, '张总', '13800138000', 'hq@shwater.com', 1, '集团最高组织架构', 1),
(2, 1, '0,1', '浦东威立雅供水公司', 1, '李厂长', '13900139001', 'pd@shwater.com', 1, '浦东新区业务', 1),
(3, 1, '0,1', '黄浦区供水分公司', 2, '王局', '13900139002', 'hp@shwater.com', 1, '黄浦区业务', 1),
(4, 1, '0,1', '徐汇区供水分公司', 3, '赵局', '13900139003', 'xh@shwater.com', 1, '徐汇区业务', 1),
(5, 1, '0,1', '长宁区供水分公司', 4, '钱局', '13900139004', 'cn@shwater.com', 1, '长宁区业务', 1),
(6, 1, '0,1', '静安区供水分公司', 5, '孙局', '13900139005', 'ja@shwater.com', 1, '静安区业务', 1),
(7, 1, '0,1', '普陀区供水分公司', 6, '周局', '13900139006', 'pt@shwater.com', 1, '普陀区业务', 1),
(8, 1, '0,1', '虹口区供水分公司', 7, '吴局', '13900139007', 'hk@shwater.com', 1, '虹口区业务', 1),
(9, 1, '0,1', '杨浦区供水分公司', 8, '郑局', '13900139008', 'yp@shwater.com', 1, '杨浦区业务', 1),
(10, 1, '0,1', '闵行区供水分公司', 9, '陈局', '13900139009', 'mh@shwater.com', 1, '闵行区业务', 1),
(11, 1, '0,1', '宝山区供水分公司', 10, '褚局', '13900139010', 'bs@shwater.com', 1, '宝山区业务', 1),
(12, 1, '0,1', '嘉定区供水分公司', 11, '卫局', '13900139011', 'jd@shwater.com', 1, '嘉定区业务', 1),
(13, 1, '0,1', '金山区供水分公司', 12, '蒋局', '13900139012', 'js@shwater.com', 1, '金山区业务', 1),
(14, 1, '0,1', '松江区供水分公司', 13, '沈局', '13900139013', 'sj@shwater.com', 1, '松江区业务', 1),
(15, 1, '0,1', '青浦区供水分公司', 14, '韩局', '13900139014', 'qp@shwater.com', 1, '青浦区业务', 1),
(16, 1, '0,1', '奉贤区供水分公司', 15, '杨局', '13900139015', 'fx@shwater.com', 1, '奉贤区业务', 1),
(17, 1, '0,1', '崇明区供水分公司', 16, '朱局', '13900139016', 'cm@shwater.com', 1, '崇明区业务', 1);

-- 2. 管理员账号 (密码: admin123 经过 bcrypt 处理的 hash)
INSERT INTO sys_user (id, username, password, nickname, email, phone, gender, avatar, dept_id, status, remark, created_by) 
VALUES (1, 'admin', '$2b$10$kthni4frECVuap.W9tX3teEzKBhYNA3XTBVHbP/0s72f8tTHDR2LO', '超级管理员', 'admin@trae.ai', '18888888888', 1, '', 1, 1, '系统内置超级管理员', 1)
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- 2.1 角色与菜单测试数据
INSERT IGNORE INTO sys_role (id, role_name, role_key, role_sort, data_scope, status, remark, created_by)
VALUES (1, '超级管理员', 'admin', 1, 1, 1, '拥有所有权限的超级角色', 1);

INSERT IGNORE INTO sys_user_role (user_id, role_id) VALUES (1, 1);

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
(26, 20, '数据清洗与插值规则', 6, 'interpolate', 'governance/interpolate', 0, 0, 'gov:interpolate', 'C', 1, 1, 'Filter', '', 1),
(27, 12, '物理资产与设备台账', 5, 'asset', 'system/asset', 0, 0, 'sys:asset', 'C', 1, 1, 'Briefcase', '', 1),
(29, 12, '边缘网关设备管理', 6, 'gateway', 'system/gateway', 0, 0, 'sys:asset', 'C', 1, 1, 'Connection', '', 1),
(28, 20, '用水阶梯与费率配置', 8, 'tariff', 'analytics/tariff', 0, 0, 'analytics:tariff', 'C', 1, 1, 'PriceTag', '', 1),
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
(58, 50, '用户与账号管理', 1, 'user', 'system/user', 0, 0, 'sys:user', 'C', 1, 1, 'User', '', 1),
(53, 50, '组织架构与部门管理', 2, 'org', 'system/org', 0, 0, 'sys:org', 'C', 1, 1, 'OfficeBuilding', '', 1),
(54, 50, '角色与权限体系', 3, 'rbac', 'system/rbac', 0, 0, 'sys:rbac', 'C', 1, 1, 'Avatar', '', 1),
(55, 50, '数据字典管理', 4, 'dict', 'system/dict', 0, 0, 'sys:dict', 'C', 1, 1, 'Collection', '', 1),
(51, 50, '资产与设备台账', 5, 'asset', 'system/asset', 0, 0, 'sys:asset', 'C', 1, 1, 'Box', '', 1),
(52, 50, '备品备件与仓储管理', 6, 'inventory', 'system/inventory', 0, 0, 'sys:inventory', 'C', 1, 1, 'ShoppingCart', '', 1),
(56, 50, '安全审计与脱敏日志', 7, 'audit', 'system/audit', 0, 0, 'sys:audit', 'C', 1, 1, 'DocumentChecked', '', 1),
(57, 50, '低代码可视化组态工作台', 8, 'visual-studio', 'system/visual-studio', 0, 0, 'sys:visual', 'C', 1, 1, 'Brush', '', 1);

-- ----------------------------
-- 9. 初始化边缘网关和测点映射规则
-- ----------------------------
INSERT IGNORE INTO `iot_gateway` (`id`, `gateway_sn`, `protocol`, `is_online`, `cpu_load`, `latency`, `remark`) VALUES
(1, 'GW-SH-PD-001', 'MQTT', 1, 15.2, 12, '浦东张江网关'),
(2, 'GW-SH-XH-002', 'Modbus', 0, 0, 0, '徐汇漕河泾网关');

INSERT IGNORE INTO `iot_tag_mapping` (`device_id`, `gateway_id`, `tag_name`, `plc_address`, `standard_name`, `deadband`, `data_type`, `unit`, `scaling_factor`, `is_active`, `remark`) VALUES
(1, 1, 'PLC.S7.Temp', '40001', 'temperature', 0.5, 'float', '°C', 1.0, 1, '张江园区温度监控'),
(1, 1, 'PLC.S7.Pressure', '40003', 'pressure', 0.05, 'float', 'MPa', 1.0, 1, '张江园区水压'),
(1, 1, 'PLC.S7.FlowRate', '40005', 'flow_rate', 0.1, 'float', 'm³/h', 1.0, 1, '张江园区瞬时流量'),
(2, 2, 'Pump.Status', '10001', 'status', 0.0, 'int', '', 1.0, 1, '浦东2号泵站运行状态(1=开,0=关)'),
(2, 2, 'Pump.Freq', '40010', 'frequency', 1.0, 'float', 'Hz', 1.0, 1, '浦东2号泵站变频器频率'),
(2, 2, 'Pump.Power', '40012', 'power', 0.5, 'float', 'kW', 1.0, 1, '浦东2号泵站功率'),
(3, 1, 'WQ.Turbidity', '40020', 'turbidity', 0.01, 'float', 'NTU', 1.0, 1, '滴水湖水质浊度'),
(3, 1, 'WQ.Chlorine', '40022', 'chlorine', 0.01, 'float', 'mg/L', 1.0, 1, '滴水湖余氯'),
(3, 1, 'WQ.PH', '40024', 'ph', 0.05, 'float', '', 1.0, 1, '滴水湖pH值'),
(4, 2, 'ENV.Temp', '40030', 'temperature', 0.1, 'float', '°C', 1.0, 1, '徐汇地下泵站环境温度'),
(4, 2, 'ENV.Humidity', '40032', 'humidity', 0.5, 'float', '%', 1.0, 1, '徐汇地下泵站环境湿度'),
(4, 2, 'ENV.H2S', '40034', 'h2s', 0.1, 'float', 'ppm', 1.0, 1, '徐汇地下泵站硫化氢浓度'),
(4, 2, 'ENV.CO', '40036', 'co', 0.1, 'float', 'ppm', 1.0, 1, '徐汇地下泵站一氧化碳浓度'),
(4, 2, 'ENV.PM25', '40038', 'pm25', 1.0, 'float', 'ug/m3', 1.0, 1, '徐汇地下泵站PM2.5');
-- 3. DMA分区测试数据 (以上海市进行设计分区)
INSERT IGNORE INTO dma_zone (id, parent_id, zone_name, level, created_by) VALUES
(101, 0, '上海市供水总管网', 1, 1),
(102, 101, '浦东新区', 2, 1),
(103, 101, '黄浦区', 2, 1),
(104, 101, '徐汇区', 2, 1),
(105, 101, '长宁区', 2, 1),
(106, 101, '静安区', 2, 1),
(107, 101, '普陀区', 2, 1),
(108, 101, '虹口区', 2, 1),
(109, 101, '杨浦区', 2, 1),
(110, 101, '闵行区', 2, 1),
(111, 101, '宝山区', 2, 1),
(112, 101, '嘉定区', 2, 1),
(113, 101, '金山区', 2, 1),
(114, 101, '松江区', 2, 1),
(115, 101, '青浦区', 2, 1),
(116, 101, '奉贤区', 2, 1),
(117, 101, '崇明区', 2, 1),
-- 增加一些三级 DMA 分区作为底层挂载节点
(201, 102, '张江高科技园区DMA', 3, 1),
(202, 102, '临港新片区DMA', 3, 1),
(203, 102, '陆家嘴金融区DMA', 3, 1),
(204, 104, '漕河泾开发区DMA', 3, 1),
(205, 110, '紫竹高新区DMA', 3, 1),
(206, 112, '嘉定汽车城DMA', 3, 1);

-- 4. 设备资产测试数据 (匹配上海市DMA)
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (1, 'METER_IN_01', '张江园区总进水管表', 1, 1);
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (2, 'PUMP_01', '浦东2号泵站主泵', 4, 1);
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (203, 'PRESS_01', '张江末端管网压力计', 2, 1);
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (3, 'WQ_01', '滴水湖水质监测仪', 3, 1);
INSERT IGNORE INTO ast_device (id, device_code, device_name, device_type, created_by) VALUES (4, 'ENV_01', '徐汇地下泵站环境传感器', 5, 1);

-- 5. DMA 与 设备资产 绑定关系
INSERT IGNORE INTO dma_device_rel (id, zone_id, device_id, direction) VALUES (1, 201, 1, 1); -- 张江
INSERT IGNORE INTO dma_device_rel (id, zone_id, device_id, direction) VALUES (2, 102, 2, -1); -- 浦东
INSERT IGNORE INTO dma_device_rel (id, zone_id, device_id, direction) VALUES (3, 201, 203, 0); -- 张江
INSERT IGNORE INTO dma_device_rel (id, zone_id, device_id, direction) VALUES (4, 202, 3, 0); -- 临港
INSERT IGNORE INTO dma_device_rel (id, zone_id, device_id, direction) VALUES (5, 204, 4, 0); -- 漕河泾

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

-- ==========================================
-- 阶段三：数据中台与营收对账 (Billing & Data Governance) 种子数据
-- ==========================================

-- 1. 费率配置
INSERT IGNORE INTO biz_tariff (id, tariff_code, tariff_name, price_per_m3, description) VALUES
(1, 'T_RESIDENTIAL', '居民生活用水', 2.8000, '上海市居民第一阶梯水价'),
(2, 'T_INDUSTRIAL', '工业生产用水', 4.5000, '工业园区及高耗水企业统一水价'),
(3, 'T_COMMERCIAL', '商业服务用水', 5.2000, '大型商圈及服务业水价'),
(4, 'T_SPECIAL', '特种行业用水', 12.0000, '洗车、高尔夫球场等高水耗行业');

-- 2. 大用户档案 (挂载到上海市真实 DMA)
INSERT IGNORE INTO biz_key_account (id, account_no, account_name, contact, phone, address, industry_type, tariff_id, meter_device_id) VALUES
(1, 'KA-2026-0001', '张江微电子制造中心', '王厂长', '13811112222', '上海市浦东新区张江高科技园区', '半导体制造', 2, 1),
(2, 'KA-2026-0002', '临港超级工厂', '马总', '13922223333', '上海市浦东新区临港新片区', '汽车制造', 2, 3),
(3, 'KA-2026-0003', '陆家嘴国金中心', '刘经理', '13733334444', '上海市浦东新区世纪大道8号', '商业综合体', 3, NULL),
(4, 'KA-2026-0004', '漕河泾科技绿洲', '陈主任', '13644445555', '上海市徐汇区漕河泾开发区', '软件及服务', 3, 4);

-- 3. 营收账单 (生成2026年3月和4月的模拟账单)
INSERT IGNORE INTO biz_billing (id, account_id, billing_period, usage_m3, total_amount, status) VALUES
(1, 1, '2026-03', 12500.50, 56252.25, 'paid'),
(2, 1, '2026-04', 13200.00, 59400.00, 'unpaid'),
(3, 2, '2026-03', 45000.00, 202500.00, 'paid'),
(4, 2, '2026-04', 46500.00, 209250.00, 'unpaid'),
(5, 3, '2026-03', 8500.00, 44200.00, 'paid'),
(6, 4, '2026-03', 3200.00, 16640.00, 'paid');

-- 4. 夜间最小流量 (MNF) 基线数据 (针对张江DMA: zone_id = 201)
INSERT IGNORE INTO biz_mnf_analysis (id, zone_id, analysis_date, mnf_value, baseline_value, anomaly_score, status) VALUES
(1, 201, '2026-04-01', 12.5, 12.0, 0.1, 'normal'),
(2, 201, '2026-04-02', 12.2, 12.0, 0.05, 'normal'),
(3, 201, '2026-04-03', 15.8, 12.0, 0.85, 'anomaly'),
(4, 201, '2026-04-04', 18.5, 12.0, 1.5, 'anomaly'),
(5, 201, '2026-04-05', 12.8, 12.0, 0.15, 'normal');

-- 5. 产销差 (NRW) 报表 (针对几个主要 DMA，含细分流量用于桑基图渲染)
INSERT IGNORE INTO biz_nrw_report (id, zone_id, report_month, supply_m3, consumption_m3, nrw_m3, nrw_ratio, residential_m3, industrial_m3, commercial_m3, apparent_loss_m3, real_loss_m3) VALUES
(1, 201, '2026-03', 150000, 132000, 18000, 12.00, 50000, 60000, 22000, 4000, 14000),
(2, 202, '2026-03', 280000, 255000, 25000, 8.93, 80000, 120000, 55000, 8000, 17000),
(3, 204, '2026-03', 85000, 75000, 10000, 11.76, 30000, 20000, 25000, 3000, 7000),
(4, 102, '2026-03', 850000, 720000, 130000, 15.29, 300000, 250000, 170000, 40000, 90000);

-- 6. 数据清洗与插值规则表
INSERT IGNORE INTO biz_interpolate_rule (id, device_id, tag_name, method, max_gap_minutes, status) VALUES
(1, 1, 'flow_rate', 'pchip', 120, 1),
(2, 2, 'frequency', 'linear', 60, 1),
(3, 3, 'turbidity', 'previous', 30, 1);

-- 7. 抄表底度记录表
INSERT IGNORE INTO biz_meter_reading (id, account_id, device_id, reading_period, reading_value) VALUES
(1, 1, 1, '2026-02', 100000.00),
(2, 1, 1, '2026-03', 112500.50),
(3, 1, 1, '2026-04', 125700.50),
(4, 2, 3, '2026-02', 500000.00),
(5, 2, 3, '2026-03', 545000.00),
(6, 2, 3, '2026-04', 591500.00);