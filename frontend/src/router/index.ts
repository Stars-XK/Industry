import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 静态路由配置：按照《前端路由与菜单规范》全量写死，便于早期本地开发预览
export const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '统一登录页' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '数字孪生大屏' }
      },
      // === 1. 综合业务监控台 ===
      {
        path: 'scada/overview',
        name: 'ScadaOverview',
        component: () => import('../views/scada/overview.vue'),
        meta: { title: '全局态势感知' }
      },
      {
        path: 'scada/topology',
        name: 'ScadaTopology',
        component: () => import('../views/scada/topology.vue'),
        meta: { title: '2D拓扑与分区导航' }
      },
      {
        path: 'scada/hmi',
        name: 'ScadaHMI',
        component: () => import('../views/scada/hmi.vue'),
        meta: { title: '工业SCADA组态' }
      },
      {
        path: 'scada/security',
        name: 'ScadaSecurity',
        component: () => import('../views/scada/security.vue'),
        meta: { title: '安防与环境空间' }
      },
      // === 2. 多维统计与数据分析 ===
      {
        path: 'analytics/nrw',
        name: 'AnalyticsNRW',
        component: () => import('../views/analytics/nrw.vue'),
        meta: { title: 'DMA产销差与漏损报表' }
      },
      {
        path: 'analytics/mnf',
        name: 'AnalyticsMNF',
        component: () => import('../views/analytics/mnf.vue'),
        meta: { title: '夜间最小流量分析' }
      },
      {
        path: 'analytics/key-account',
        name: 'AnalyticsKeyAccount',
        component: () => import('../views/analytics/key-account.vue'),
        meta: { title: '大用户档案与重点企业画像' }
      },
      {
        path: 'analytics/billing',
        name: 'AnalyticsBilling',
        component: () => import('../views/analytics/billing.vue'),
        meta: { title: '营收计费与出账对账管理' }
      },
      {
        path: 'analytics/energy',
        name: 'AnalyticsEnergy',
        component: () => import('../views/analytics/energy.vue'),
        meta: { title: '综合能效优化与动态成本核算' }
      },
      {
        path: 'analytics/predict',
        name: 'AnalyticsPredict',
        component: () => import('../views/analytics/predict.vue'),
        meta: { title: '用量与能耗AI预测分析' }
      },
      {
        path: 'analytics/hydraulic',
        name: 'AnalyticsHydraulic',
        component: () => import('../views/analytics/hydraulic.vue'),
        meta: { title: '在线水力模型仿真与推演' }
      },
      // === 3. 运维治理与协同闭环 ===
      {
        path: 'workflow/alarm',
        name: 'WorkflowAlarm',
        component: () => import('../views/workflow/alarm.vue'),
        meta: { title: '报警风暴收敛中心' }
      },
      {
        path: 'workflow/work-order',
        name: 'WorkflowWorkOrder',
        component: () => import('../views/workflow/work-order.vue'),
        meta: { title: '工单与巡检全生命周期管理' }
      },
      {
        path: 'workflow/aigc',
        name: 'WorkflowAIGC',
        component: () => import('../views/workflow/aigc.vue'),
        meta: { title: 'AI智能调度与协同指挥' }
      },
      {
        path: 'workflow/duty',
        name: 'WorkflowDuty',
        component: () => import('../views/workflow/duty.vue'),
        meta: { title: '消息通知与排班调度' }
      },
      {
        path: 'workflow/sop',
        name: 'WorkflowSOP',
        component: () => import('../views/workflow/sop.vue'),
        meta: { title: '应急预案与SOP数字化管理' }
      },
      // === 4. 数据中台与治理底座 ===
      {
        path: 'governance/integration',
        name: 'GovIntegration',
        component: () => import('../views/governance/integration.vue'),
        meta: { title: '异构设备与数据源接入' }
      },
      {
        path: 'governance/revenue',
        name: 'GovRevenue',
        component: () => import('../views/governance/revenue.vue'),
        meta: { title: '营收数据融合与清洗配置' }
      },
      {
        path: 'governance/interpolate',
        name: 'GovInterpolate',
        component: () => import('../views/governance/interpolate.vue'),
        meta: { title: '累积量换算与插值容错规则' }
      },
      {
        path: 'governance/interlock',
        name: 'GovInterlock',
        component: () => import('../views/governance/interlock.vue'),
        meta: { title: 'SCADA报警联锁与规则引擎' }
      },
      {
        path: 'governance/edge-tag',
        name: 'GovEdgeTag',
        component: () => import('../views/governance/edge-tag.vue'),
        meta: { title: '边缘网关与测点标签管理' }
      },
      {
        path: 'governance/recipe',
        name: 'GovRecipe',
        component: () => import('../views/governance/recipe.vue'),
        meta: { title: '工业配方管理' }
      },
      {
        path: 'governance/sensor',
        name: 'GovSensor',
        component: () => import('../views/governance/sensor.vue'),
        meta: { title: '数据清洗与传感器健康度' }
      },
      // === 5. 系统设置与台账权限 ===
      {
        path: 'system/asset',
        name: 'SystemAsset',
        component: () => import('../views/system/asset.vue'),
        meta: { title: '资产与设备台账' }
      },
      {
        path: 'system/inventory',
        name: 'SystemInventory',
        component: () => import('../views/system/inventory.vue'),
        meta: { title: '备品备件与仓储管理' }
      },
      {
        path: 'system/org',
        name: 'SystemOrg',
        component: () => import('../views/system/org.vue'),
        meta: { title: '组织架构与人员管理' }
      },
      {
        path: 'system/rbac',
        name: 'SystemRBAC',
        component: () => import('../views/system/rbac.vue'),
        meta: { title: '角色与权限体系' }
      },
      {
        path: 'system/dict',
        name: 'SystemDict',
        component: () => import('../views/system/dict.vue'),
        meta: { title: '数据字典管理' }
      },
      {
        path: 'system/audit',
        name: 'SystemAudit',
        component: () => import('../views/system/audit.vue'),
        meta: { title: '安全审计与脱敏日志' }
      },
      {
        path: 'system/visual-studio',
        name: 'SystemVisualStudio',
        component: () => import('../views/system/visual-studio.vue'),
        meta: { title: '低代码可视化组态工作台' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
});

// 由于当前转为全静态路由预览模式，我们暂时简化拦截逻辑，仅保留 token 校验
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.path === '/login') {
    if (token) next('/'); 
    else next(); 
  } else {
    // 如果没有登录，跳回登录页
    if (!token) next(`/login?redirect=${to.path}`);
    else next();
  }
});

export default router;
