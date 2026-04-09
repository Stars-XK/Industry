import os
import re

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make .app-container exactly what the user wants:
new_app_container = """
/* Base App Container & Layout */
.app-container {
  padding: 24px;
  background-color: var(--el-bg-color); /* The white panel background */
  border-radius: 12px;
  box-shadow: var(--el-box-shadow);
  border: 1px solid var(--el-border-color-light);
  height: 96%; /* Default height 96% */
  width: 50%;  /* Default width 50% */
  margin: 2vh 48% 2vh 2%; /* 2% top, 48% right, 2% bottom, 2% left */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease, height 0.3s ease, margin 0.3s ease, background-color 0.3s ease;
}

.app-container.wide-panel {
  width: 96%;
  height: 96%;
  margin: 2vh 2%; /* 2% top/bottom, 2% left/right */
}
"""

content = re.sub(r'\/\* Base App Container & Layout \*\/\n\.app-container \{[\s\S]*?\.app-container\.wide-panel \{[^}]*\}', new_app_container.strip(), content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css 50x96 and 96x96 margins")
