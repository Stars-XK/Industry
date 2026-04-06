const fs = require('fs');
const path = require('path');

const views = [
  'scada/overview', 'scada/topology', 'scada/hmi', 'scada/security',
  'analytics/nrw', 'analytics/mnf', 'analytics/key-account', 'analytics/billing', 'analytics/energy', 'analytics/predict', 'analytics/hydraulic',
  'workflow/alarm', 'workflow/work-order', 'workflow/aigc', 'workflow/duty', 'workflow/sop',
  'governance/integration', 'governance/revenue', 'governance/interpolate', 'governance/interlock', 'governance/edge-tag', 'governance/recipe', 'governance/sensor',
  'system/asset', 'system/inventory', 'system/org', 'system/rbac', 'system/audit', 'system/visual-studio'
];

views.forEach(view => {
  const filePath = path.join(__dirname, '..', 'src', 'views', `${view}.vue`);
  // 如果文件不存在则创建
  if (!fs.existsSync(filePath)) {
    const content = `<template>
  <div class="page-container">
    <h2>模块: ${view}</h2>
    <p>当前页面路径: /${view}</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.page-container { padding: 20px; background: #fff; height: 100%; border-radius: 4px; }
</style>
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created: ${filePath}`);
  }
});
