with open('backend/scripts/sql/mysql_seed.sql', 'a', encoding='utf-8') as f:
    f.write("""
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(57, 50, '低代码可视化组态工作台', 8, 'visual-studio', 'system/visual-studio', 0, 0, 'sys:visual', 'C', 1, 1, 'Brush', '', 1);
""")
