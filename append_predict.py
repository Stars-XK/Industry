with open('backend/scripts/sql/mysql_seed.sql', 'a', encoding='utf-8') as f:
    f.write("""
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(27, 20, '用量与能耗AI预测分析', 7, 'predict', 'analytics/predict', 0, 0, 'analytics:predict', 'C', 1, 1, 'DataAnalysis', '', 1);
""")
