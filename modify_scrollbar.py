import os

path = '/workspace/frontend/src/assets/premium-theme.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

scrollbar_css = """
/* ==============================================================
   Custom Premium Scrollbar
   ============================================================== */
/* Webkit browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-darker);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-text-color-secondary);
}

/* Firefox & Standard (partial support) */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color-darker) transparent;
}
"""

if '::-webkit-scrollbar' not in content:
    content += '\n' + scrollbar_css

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated scrollbar styles")
