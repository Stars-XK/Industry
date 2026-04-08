with open('backend/scripts/sql/mysql_seed.sql', 'a', encoding='utf-8') as f:
    f.write("""
-- 补齐 Analytics 菜单
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(22, 20, '夜间最小流量分析', 2, 'mnf', 'analytics/mnf', 0, 0, 'analytics:mnf', 'C', 1, 1, 'Moon', '', 1),
(28, 20, '在线水力模型推演', 8, 'hydraulic', 'analytics/hydraulic', 0, 0, 'analytics:hydraulic', 'C', 1, 1, 'Connection', '', 1);

-- 补齐 Workflow 菜单
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(33, 30, 'AI智能调度与指挥', 3, 'aigc', 'workflow/aigc', 0, 0, 'work:aigc', 'C', 1, 1, 'ChatDotRound', '', 1);

-- 补齐 SCADA 菜单
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(14, 10, '安防与环境空间监控', 4, 'security', 'scada/security', 0, 0, 'scada:security', 'C', 1, 1, 'VideoCamera', '', 1);

-- 补齐 Governance 菜单
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(41, 40, '异构设备与数据源', 1, 'integration', 'governance/integration', 0, 0, 'gov:integration', 'C', 1, 1, 'Link', '', 1),
(42, 40, '营收数据融合清洗', 2, 'revenue', 'governance/revenue', 0, 0, 'gov:revenue', 'C', 1, 1, 'Money', '', 1),
(43, 40, '累积量插值容错', 3, 'interpolate', 'governance/interpolate', 0, 0, 'gov:interpolate', 'C', 1, 1, 'DataLine', '', 1),
(44, 40, '报警联锁规则引擎', 4, 'interlock', 'governance/interlock', 0, 0, 'gov:interlock', 'C', 1, 1, 'Warning', '', 1),
(47, 40, '数据清洗与健康度', 7, 'sensor', 'governance/sensor', 0, 0, 'gov:sensor', 'C', 1, 1, 'Aim', '', 1);

-- 补齐 System 菜单
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(51, 50, '资产与设备台账', 1, 'asset', 'system/asset', 0, 0, 'sys:asset', 'C', 1, 1, 'Box', '', 1);
""")
