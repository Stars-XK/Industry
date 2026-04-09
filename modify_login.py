import os

path = '/workspace/frontend/src/views/login/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the default flex layout for .app-container since login uses .login-layout
# Make sure .form-section has correct width and padding
content = content.replace('max-width: 600px;', 'max-width: 600px;\n  width: 100%;')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated login.vue")
