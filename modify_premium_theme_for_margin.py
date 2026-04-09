import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make .app-container exactly what the user wants:
# Default (50x90): padding (actually margin) top 5%, bottom 5%, left 5%, right 45% -> effectively width 50% placed at left 5%.
# Wait, if width is 50%, and we want it to be 5% from left and 5% from top/bottom.
# It's better to set: width: 50%; height: 90%; margin: 5vh 45% 5vh 5%;
# Wide panel (90x90): width: 90%; height: 90%; margin: 5vh 5%;

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
  margin: 5vh 45% 5vh 5%; /* 5% top, 45% right, 5% bottom, 5% left */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease, height 0.3s ease, margin 0.3s ease, background-color 0.3s ease;
}

.app-container.wide-panel {
  width: 90%;
  height: 90%;
  margin: 5vh 5%; /* 5% top/bottom, 5% left/right */
}
"""

import re
content = re.sub(r'\/\* Base App Container & Layout \*\/\n\.app-container \{[\s\S]*?\.app-container\.wide-panel \{[^}]*\}', new_app_container.strip(), content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated premium-theme.css margins")
