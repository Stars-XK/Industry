import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

responsive_css = """
/* ==============================================================
   Responsive Fixes for Narrow Panels (50x96)
   ============================================================== */
/* Fix header actions wrapping */
.page-header {
  flex-wrap: wrap;
  gap: 16px;
  height: auto;
}
.header-actions, .filter-container, .search-bar, .toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.header-actions .el-button, 
.filter-container .el-button,
.search-bar .el-button {
  margin-left: 0 !important;
}

/* Force tables to scroll horizontally instead of wrapping text into tall, ugly rows */
.el-table .cell {
  white-space: nowrap !important;
  word-break: keep-all !important;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Pagination wrap */
.el-pagination {
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

/* Inline forms wrap safely */
.el-form--inline .el-form-item {
  margin-right: 16px;
  margin-bottom: 16px;
}
"""

if 'Responsive Fixes for Narrow Panels' not in content:
    content += '\n' + responsive_css

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css with table and wrap fixes")
