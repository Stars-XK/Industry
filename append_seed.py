with open('backend/scripts/sql/mysql_seed.sql', 'a', encoding='utf-8') as f:
    f.write("""
-- 插入备品备件种子数据
INSERT INTO ast_inventory (id, part_name, part_code, category, specification, unit, stock_quantity, safe_stock, unit_price, location, status) VALUES
(1, 'DN100蝶阀', 'V-DN100-01', 'valve', 'DN100', '个', 5, 10, 850.00, 'A区货架1', 1),
(2, '智能超声波水表', 'M-US-02', 'meter', 'DN50', '台', 20, 5, 1200.00, 'B区货架2', 1),
(3, 'PAC(聚合氯化铝)', 'C-PAC-01', 'chemical', '工业级25kg/袋', '袋', 150, 50, 45.00, '化工库', 1),
(4, '潜水排污泵', 'P-SUB-01', 'other', '5.5kW', '台', 2, 1, 3500.00, 'C区重型货架', 1);

INSERT INTO ast_inventory_log (part_id, order_id, change_type, quantity, after_stock, operator_id, remark) VALUES
(1, NULL, 1, 5, 5, 1, '初始化入库'),
(2, NULL, 1, 20, 20, 1, '初始化入库'),
(3, NULL, 1, 150, 150, 1, '初始化入库'),
(4, NULL, 1, 2, 2, 1, '初始化入库');
""")
