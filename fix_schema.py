import re

with open('backend/scripts/sql/mysql_schema.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all SET FOREIGN_KEY_CHECKS = 1; except the last one
content = re.sub(r'SET FOREIGN_KEY_CHECKS = 1;\n*', '', content)

# Find duplicates and remove them
# sys_dept
content = re.sub(r'-- 20\. 部门/组织架构表\nCREATE TABLE IF NOT EXISTS sys_dept \([^;]+;\n*', '', content)
# sys_dict_type
content = re.sub(r'-- 18\. 数据字典类型表\nCREATE TABLE IF NOT EXISTS sys_dict_type \([^;]+;\n*', '', content)
# sys_dict_data
content = re.sub(r'-- 19\. 数据字典数据表\nCREATE TABLE IF NOT EXISTS sys_dict_data \([^;]+;\n*', '', content)
# iot_tag_mapping (the 21. 测点与时序标签映射表)
content = re.sub(r'-- 21\. 测点与时序标签映射表 \(补全\)\nCREATE TABLE IF NOT EXISTS iot_tag_mapping \([^;]+;\n*', '', content)

# Append ast_inventory and ast_inventory_log before SET FOREIGN_KEY_CHECKS = 1;
inventory_sql = """
-- 25. 备品备件库存表
CREATE TABLE IF NOT EXISTS ast_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL COMMENT '备件名称',
    part_code VARCHAR(50) UNIQUE NOT NULL COMMENT '备件编码',
    category VARCHAR(50) COMMENT '分类: valve, meter, chemical, other',
    specification VARCHAR(100) COMMENT '规格型号',
    unit VARCHAR(20) COMMENT '单位',
    stock_quantity DECIMAL(10,2) DEFAULT 0 COMMENT '当前库存数量',
    safe_stock DECIMAL(10,2) DEFAULT 0 COMMENT '安全库存预警线',
    unit_price DECIMAL(10,2) DEFAULT 0 COMMENT '单价(成本核算用)',
    location VARCHAR(100) COMMENT '仓库位置',
    status SMALLINT DEFAULT 1 COMMENT '1-正常, 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='备品备件库存表';

-- 26. 库存出入库流水表
CREATE TABLE IF NOT EXISTS ast_inventory_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id BIGINT NOT NULL COMMENT '备件ID',
    order_id BIGINT COMMENT '关联工单ID(出库用)',
    change_type SMALLINT NOT NULL COMMENT '1-入库, -1-出库, 0-盘点修正',
    quantity DECIMAL(10,2) NOT NULL COMMENT '变动数量',
    after_stock DECIMAL(10,2) NOT NULL COMMENT '变动后库存',
    operator_id BIGINT COMMENT '操作人',
    remark VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES ast_inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES wf_work_order(id) ON DELETE SET NULL,
    FOREIGN KEY (operator_id) REFERENCES sys_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存出入库流水表';

SET FOREIGN_KEY_CHECKS = 1;
"""

content = content + "\n" + inventory_sql

# Add ast_inventory and ast_inventory_log to DROP TABLE list
content = content.replace('biz_recipe;', 'biz_recipe, ast_inventory, ast_inventory_log;')

with open('backend/scripts/sql/mysql_schema.sql', 'w', encoding='utf-8') as f:
    f.write(content)
