import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update .app-container to be the white panel
new_app_container = """
/* Base App Container & Layout */
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color); /* The white panel background */
  border-radius: 12px;
  box-shadow: var(--el-box-shadow);
  border: 1px solid var(--el-border-color-light);
  height: 90%; /* Default height 90% */
  width: 50%;  /* Default width 50% */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease, height 0.3s ease, background-color 0.3s ease;
}

.app-container.wide-panel {
  width: 90%;
  height: 90%;
}
"""

# Find and replace the existing .app-container definition
import re
content = re.sub(r'\/\* Base App Container & Layout \*\/\n\.app-container \{[^}]+\}', new_app_container.strip(), content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css with panel sizes")
