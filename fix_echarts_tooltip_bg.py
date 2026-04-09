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

replacements = {
    "'rgba(255, 255, 255, 0.9)'": "document.documentElement.classList.contains('dark') ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)'"
}

# Actually we don't need to do dynamic logic for tooltip background, just let it be a hardcoded color or remove it so it uses ECharts default.
