import os
import re

directories = ['/workspace/frontend/src/views']

for root, _, files in os.walk(directories[0]):
    for f in files:
        if f.endswith('.vue'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original_content = content
            
            # 1. Add show-overflow-tooltip to <el-table-column>
            def tweak_column(match):
                tag = match.group(0)
                if 'type="selection"' in tag or 'type="index"' in tag or 'type="expand"' in tag:
                    return tag
                
                new_tag = tag
                # Add show-overflow-tooltip if missing
                if 'show-overflow-tooltip' not in new_tag and ('prop=' in new_tag or 'label=' in new_tag):
                    if new_tag.endswith('/>'):
                        new_tag = new_tag[:-2] + ' show-overflow-tooltip />'
                    else:
                        new_tag = new_tag[:-1] + ' show-overflow-tooltip>'
                        
                # Add min-width if width and min-width are missing
                if 'width=' not in new_tag and 'min-width' not in new_tag and ('prop=' in new_tag or 'label=' in new_tag):
                    if new_tag.endswith('/>'):
                        new_tag = new_tag[:-2] + ' min-width="120" />'
                    else:
                        new_tag = new_tag[:-1] + ' min-width="120">'
                        
                return new_tag

            content = re.sub(r'<el-table-column[^>]+>', tweak_column, content)
            
            # 2. Fix header-actions / filter-container styles that use strict margin-left
            # We will use global CSS for this, but let's remove strict inline margins
            content = content.replace('style="margin-left: 10px;"', '')
            content = content.replace('style="margin-left: 16px;"', '')
            content = content.replace('style="margin-left: 20px;"', '')

            # If it's dma-config.vue or similar, replace el-col fixed spans to make it responsive
            if 'dma-config.vue' in path or 'rbac.vue' in path:
                content = content.replace(':span="4"', ':xs="24" :sm="8" :md="6" :lg="6"')
                content = content.replace(':span="20"', ':xs="24" :sm="16" :md="18" :lg="18"')
                content = content.replace(':span="6"', ':xs="24" :sm="8" :md="6" :lg="6"')
                content = content.replace(':span="18"', ':xs="24" :sm="16" :md="18" :lg="18"')

            if content != original_content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Fixed tables and layout in {f}")

print("Done fixing narrow pages tables")
