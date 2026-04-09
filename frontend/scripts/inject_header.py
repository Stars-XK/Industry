import sys
import glob

files = [
    '/workspace/frontend/src/views/system/inventory.vue',
    '/workspace/frontend/src/views/system/org.vue',
    '/workspace/frontend/src/views/system/asset.vue',
    '/workspace/frontend/src/views/system/audit.vue',
    '/workspace/frontend/src/views/analytics/nrw.vue',
    '/workspace/frontend/src/views/analytics/mnf.vue',
    '/workspace/frontend/src/views/analytics/energy.vue',
    '/workspace/frontend/src/views/scada/security.vue',
    '/workspace/frontend/src/views/scada/overview.vue',
    '/workspace/frontend/src/views/workflow/work-order.vue',
    '/workspace/frontend/src/views/workflow/sop.vue',
    '/workspace/frontend/src/views/workflow/duty.vue',
    '/workspace/frontend/src/views/workflow/alarm.vue'
]

header_css = """
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}
.header-content p {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
}
"""

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '.page-header {' not in content:
            # Inject before </style>
            content = content.replace('</style>', header_css + '</style>')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Injected into {filepath}")
    except Exception as e:
        print(e)
