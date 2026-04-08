import os

DIR = 'backend/apps'

def update_main_ts(directory):
    for root, dirs, files in os.walk(directory):
        if 'main.ts' in files:
            path = os.path.join(root, 'main.ts')
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            if 'app.setGlobalPrefix' not in content:
                content = content.replace('await app.listen', "app.setGlobalPrefix('api/v1');\n  await app.listen")
            elif "setGlobalPrefix('api')" in content:
                content = content.replace("setGlobalPrefix('api')", "setGlobalPrefix('api/v1')")
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated global prefix in {path}")

update_main_ts(DIR)
print("Done.")
