import os
import re

directories = ['/workspace/frontend/src/views']

# We will remove the injected min-width="120" and show-overflow-tooltip from the tables
# and instead, let's carefully adjust widths on specific columns if needed, or just let Element Plus calculate it dynamically.
# By removing the injected min-width="120", the columns will distribute themselves naturally based on their contents.

for root, _, files in os.walk(directories[0]):
    for f in files:
        if f.endswith('.vue'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original_content = content
            
            # Remove injected min-width="120"
            content = content.replace(' min-width="120"', '')
            
            # For show-overflow-tooltip, let's leave it on because it's harmless and helps when columns DO get too small naturally,
            # but we remove the forced min-width so they can shrink if they want to.
            
            # If the user specifically said "要根据内容宽度，修改适合的宽度啊", they want dynamic widths or specific widths.
            # Element Plus `el-table-column` without width/min-width will dynamically distribute width based on cell content.
            # Let's ensure columns that *should* be small (like ID, Status) get small widths, 
            # and columns that should be large get min-width.
            
            # We can do a heuristic replacement:
            def adjust_column(match):
                tag = match.group(0)
                if 'width=' in tag or 'min-width=' in tag:
                    return tag # already has specific width
                
                # Heuristics based on label
                if 'label="ID"' in tag or 'label="序号"' in tag:
                    tag = tag.replace('>', ' width="80">').replace('/>', 'width="80" />')
                elif 'label="状态"' in tag or 'label="级别"' in tag or 'label="类型"' in tag:
                    tag = tag.replace('>', ' width="100">').replace('/>', 'width="100" />')
                elif 'label="操作"' in tag:
                    tag = tag.replace('>', ' width="180" fixed="right">').replace('/>', 'width="180" fixed="right" />')
                elif 'label="时间"' in tag or 'label="日期"' in tag or 'label="创建时间"' in tag:
                    tag = tag.replace('>', ' width="180">').replace('/>', 'width="180" />')
                else:
                    # For generic columns, let them flex, but give a small min-width so they don't crush to 0
                    # A min-width of 100 is usually safer than 120 for 50% panels
                    tag = tag.replace('>', ' min-width="100">').replace('/>', 'min-width="100" />')
                    
                return tag

            content = re.sub(r'<el-table-column\s+[^>]*>', adjust_column, content)
            
            if content != original_content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Adjusted column widths intelligently in {f}")

print("Done adjusting specific widths")
