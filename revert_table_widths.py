import os
import re

directories = ['/workspace/frontend/src/views']

# The user wants to "去掉这样的强制拦截", which means they don't want us injecting min-width="120" or min-width="100" everywhere.
# They just want the table to naturally size itself, but fix the ugly wrapping.
# Element Plus tables wrap text when columns are too small, unless white-space: nowrap is set, or if columns have show-overflow-tooltip.
# Wait, if we use show-overflow-tooltip, the cell text won't wrap anyway!
# So we just need to make sure we remove the forced `min-width` we added in the previous step, so columns can be naturally sized by the browser/Element Plus.

for root, _, files in os.walk(directories[0]):
    for f in files:
        if f.endswith('.vue'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Remove the min-width="100" we just added
            content = content.replace(' min-width="100"', '')
            content = content.replace(' min-width="120"', '')
            
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)

print("Reverted forced min-widths")
