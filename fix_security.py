import os

path = '/workspace/frontend/src/views/scada/security.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make the page immersive
css_replace = """
.app-container {
  padding: 12px;
  background-color: var(--el-bg-color);
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.page-subtitle {
  display: none;
}
"""

content = content.replace('.app-container {\n  padding: 24px;\n  background-color: var(--el-bg-color-page);\n  min-height: calc(100vh - 60px);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  width: 100%;\n}\n\n.page-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-end;\n  margin-bottom: 32px;\n  padding-bottom: 24px;\n  border-bottom: 1px solid var(--el-border-color-light);\n}\n\n.page-title {\n  font-size: 32px;\n  font-weight: 700;\n  margin: 0 0 8px 0;\n  letter-spacing: -0.5px;\n  color: var(--el-text-color-primary);\n}\n\n.page-subtitle {\n  font-size: 15px;\n  color: var(--el-text-color-regular);\n  margin: 0;\n  letter-spacing: 0.5px;\n}', css_replace)

# Adjust height
content = content.replace('height: calc(100vh - 160px);', 'flex: 1;')
content = content.replace('<el-row :gutter="24">', '<el-row :gutter="12" style="flex: 1; min-height: 0;">')
content = content.replace('<el-col :span="16">', '<el-col :span="18" style="display: flex; flex-direction: column;">')
content = content.replace('<el-col :span="8">', '<el-col :span="6" style="display: flex; flex-direction: column;">')

# Ensure video matrix fills height
content = content.replace('.video-matrix {\n  display: grid;\n  gap: 16px;\n  flex: 1;\n  min-height: 0;\n}', '.video-matrix {\n  display: grid;\n  gap: 12px;\n  flex: 1;\n  min-height: 0;\n}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated security.vue")
