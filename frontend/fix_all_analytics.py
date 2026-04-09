import os
import re

def fix_all(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                
                # ECharts generic fixes
                new_content = new_content.replace("'rgba(15, 23, 42, 0.9)'", "'var(--el-bg-color-overlay)'")
                new_content = new_content.replace("'rgba(255,255,255,0.1)'", "'var(--el-border-color-light)'")
                new_content = new_content.replace("'#e2e8f0'", "'var(--el-text-color-primary)'")
                new_content = new_content.replace("'#64748b'", "'var(--el-text-color-regular)'")
                new_content = new_content.replace("'#334155'", "'var(--el-border-color-darker)'")
                new_content = new_content.replace("'#1e293b'", "'var(--el-border-color-light)'")
                new_content = new_content.replace("'#f59e0b'", "'var(--el-color-warning)'")
                new_content = new_content.replace("'rgba(245,158,11,0.5)'", "'var(--el-color-warning-light-5)'")
                new_content = new_content.replace("'rgba(245,158,11,0.05)'", "'transparent'")
                new_content = new_content.replace("'rgba(255,255,255,0.2)'", "'var(--el-border-color-darker)'")
                new_content = new_content.replace("'rgba(0, 216, 255, 0.2)'", "'var(--el-color-primary-light-5)'")
                new_content = new_content.replace("'rgba(148, 163, 184, 0.2)'", "'var(--el-border-color-light)'")
                new_content = new_content.replace("'rgba(148, 163, 184, 0.05)'", "'var(--el-border-color-extra-light)'")
                new_content = new_content.replace("'rgba(0, 216, 255, 0.1)'", "'var(--el-color-primary-light-8)'")
                new_content = new_content.replace("'rgba(103, 194, 58, 0.3)'", "'var(--el-color-success-light-5)'")
                new_content = new_content.replace("'rgba(0, 216, 255, 0.3)'", "'var(--el-color-primary-light-5)'")
                new_content = new_content.replace("'#f43f5e'", "'var(--el-color-danger)'")
                new_content = new_content.replace("'rgba(244,63,94,0.5)'", "'var(--el-color-danger-light-5)'")

                # CSS generic fixes
                new_content = new_content.replace("rgba(230, 162, 60, 0.5)", "var(--el-color-warning-light-5)")
                new_content = new_content.replace("rgba(230, 162, 60, 0.1)", "var(--el-color-warning-light-9)")
                new_content = new_content.replace("rgba(230, 162, 60, 0.3)", "var(--el-color-warning-light-5)")
                new_content = new_content.replace("color: #F56C6C;", "color: var(--el-color-danger);")
                new_content = new_content.replace("rgba(245, 108, 108, 0.3)", "var(--el-color-danger-light-5)")
                new_content = new_content.replace("rgba(0, 216, 255, 0.05)", "var(--el-color-primary-light-9)")
                new_content = new_content.replace("rgba(0, 216, 255, 0.5)", "var(--el-color-primary-light-5)")
                new_content = new_content.replace("rgba(0, 216, 255, 0.3)", "var(--el-color-primary-light-5)")
                new_content = new_content.replace("rgba(0, 216, 255, 0.2)", "var(--el-color-primary-light-8)")
                new_content = new_content.replace("rgba(245, 158, 11, 0.1)", "var(--el-color-warning-light-9)")
                new_content = new_content.replace("rgba(245, 158, 11, 0.3)", "var(--el-color-warning-light-5)")
                new_content = new_content.replace("rgba(103, 194, 58, 0.5)", "var(--el-color-success-light-5)")
                new_content = new_content.replace("rgba(103, 194, 58, 0.1)", "var(--el-color-success-light-9)")
                new_content = new_content.replace("rgba(103, 194, 58, 0.3)", "var(--el-color-success-light-5)")

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {filepath}")

fix_all('/workspace/frontend/src/views')
