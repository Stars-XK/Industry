import os
import re

directories = [
    '/workspace/frontend/src/views/analytics',
    '/workspace/frontend/src/views/governance',
    '/workspace/frontend/src/views/scada',
    '/workspace/frontend/src/views/system',
    '/workspace/frontend/src/views/workflow',
    '/workspace/frontend/src/views/dashboard'
]

# Explicit list of narrow pages (50*96)
narrow_pages = [
    'scada/topology.vue',
    'scada/dma-config.vue',
    'analytics/key-account.vue',
    'analytics/billing.vue',
    'analytics/energy.vue',
    'analytics/predict.vue',
    'governance/interpolate.vue',
    'governance/revenue.vue',
    'workflow/alarm.vue',
    'workflow/work-order.vue',
    'workflow/duty.vue',
    'workflow/sop.vue',
    'governance/integration.vue',
    'governance/interlock.vue',
    'governance/edge-tag.vue',
    'governance/recipe.vue',
    'governance/sensor.vue',
    'system/asset.vue',
    'system/inventory.vue',
    'system/org.vue',
    'system/rbac.vue',
    'system/dict.vue',
    'system/audit.vue',
    'system/user.vue',
    'system/config.vue',
    'system/wizard.vue',
    'system/backup.vue',
    # Maybe add clean.vue or others if they exist, but we checked and revenue/interpolate handle those concepts
]

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.vue'):
                filepath = os.path.join(root, f)
                rel_path = os.path.relpath(filepath, '/workspace/frontend/src/views/')
                rel_path = rel_path.replace('\\', '/')
                
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                is_narrow = False
                for n in narrow_pages:
                    if n in rel_path:
                        is_narrow = True
                        break
                
                # We replace <div class="app-container..."> to ensure it's correct
                # Also replace dashboard-container with app-container wide-panel for dashboard
                if 'dashboard-container' in content:
                    content = content.replace('class="dashboard-container"', 'class="app-container wide-panel"')

                # First strip wide-panel to have a clean state
                content = content.replace('class="app-container wide-panel"', 'class="app-container"')
                
                if not is_narrow:
                    # If it's NOT in the narrow list, it gets wide-panel
                    content = content.replace('class="app-container"', 'class="app-container wide-panel"')

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)

print("Updated wide/narrow assignments.")
