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
]

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.vue'):
                filepath = os.path.join(root, f)
                rel_path = os.path.relpath(filepath, '/workspace/frontend/src/views/').replace('\\', '/')
                
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                is_narrow = any(n in rel_path for n in narrow_pages)
                
                # First, ensure dashboard-container becomes app-container
                content = content.replace('dashboard-container', 'app-container')
                
                # We need to find `class="... app-container ..."` and either add or remove `wide-panel`
                # Let's replace ' wide-panel' with '' everywhere first
                content = content.replace(' wide-panel', '')
                
                if not is_narrow:
                    # add wide-panel right after app-container
                    content = content.replace('app-container', 'app-container wide-panel')
                
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)

print("Updated wide/narrow with regex/robust replacement.")
