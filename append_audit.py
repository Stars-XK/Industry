with open('backend/scripts/sql/mysql_seed.sql', 'a', encoding='utf-8') as f:
    f.write("""
INSERT IGNORE INTO sys_menu (id, parent_id, menu_name, sort_order, path, component, is_frame, is_cache, perm_code, menu_type, visible, status, icon, remark, created_by) VALUES
(56, 50, '安全审计与脱敏日志', 7, 'audit', 'system/audit', 0, 0, 'sys:audit', 'C', 1, 1, 'DocumentChecked', '', 1);
""")
