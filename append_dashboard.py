with open('backend/scripts/sql/mysql_seed.sql', 'a', encoding='utf-8') as f:
    f.write("""
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(2, 0, '数字孪生大屏', 2, '/dashboard', 'dashboard/index', 0, 1, 'sys:dashboard', 'C', 1, 1, 'Odometer', '首页大屏', 1);
""")
