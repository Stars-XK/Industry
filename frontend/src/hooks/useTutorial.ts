import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

export const tutorials: Record<string, any[]> = {
  '/dashboard': [
    { element: '.top-menu-list', popover: { title: '顶部导航', description: '这里是系统的一级菜单模块，您可以快速切换数字大屏、业务监控、数据中台等大类。', side: 'bottom' } },
    { element: '.user-info', popover: { title: '用户中心', description: '点击这里可以修改个人信息、查看帮助文档或退出登录。', side: 'left' } },
    { element: '.kpi-card', popover: { title: '核心 KPI', description: '实时监控供水量、漏损率等关键指标。', side: 'bottom' } }
  ],
  '/system/asset': [
    { element: '.toolbar-actions', popover: { title: '资产操作区', description: '您可以新增资产，或者使用刚加的【批量导入】按钮通过 Excel 快速上传设备清单。', side: 'bottom' } },
    { element: '.search-bar', popover: { title: '组合检索', description: '通过设备编码、状态快速过滤设备。', side: 'bottom' } },
    { element: '.el-table', popover: { title: '设备台账', description: '这里展示了所有的物理资产。您在这里维护的泵站和水表，将直接在【SCADA监控】和【大用户档案】中被关联使用！', side: 'top' } }
  ],
  '/system/org': [
    { element: '.toolbar-actions', popover: { title: '组织与人员管理', description: '点击批量导入可快速建立您的企业树形组织架构及人员信息。', side: 'bottom' } },
    { element: '.el-table', popover: { title: '部门列表', description: '支持无限层级的子部门管理，并可以为人分配账号。', side: 'top' } }
  ],
  '/system/rbac': [
    { element: '.toolbar-actions', popover: { title: '角色权限', description: '您可以管理不同的角色权限和菜单授权。', side: 'bottom' } },
    { element: '.el-table', popover: { title: '角色列表', description: '不同角色可以看到不同的菜单，访问不同的数据范围。', side: 'top' } }
  ],
  '/analytics/key-account': [
    { element: '.toolbar-actions', popover: { title: '大户管理', description: '支持通过 Excel 导入企业档案。', side: 'bottom' } },
    { element: '.el-table', popover: { title: '大用户档案', description: '在这里，您需要为每个企业绑定一个【物理资产】中的智能水表，同时可以将其归属到特定的【DMA分区】中，用于计算分区的售水量。', side: 'top' } }
  ]
}

export function useTutorial() {
  const route = useRoute()
  
  const startTutorial = (forcePath?: string) => {
    const path = forcePath || route.path
    
    // Fallback if no specific tutorial
    const steps = tutorials[path] || [
      { popover: { title: '欢迎使用', description: '这是一个高级的工业级业务列表页面。' } },
      { element: '.toolbar-actions', popover: { title: '快捷操作', description: '您可以在此进行新增、批量导入和刷新等操作。', side: 'bottom' } },
      { element: '.search-bar', popover: { title: '数据检索', description: '支持多条件的高级筛选。', side: 'bottom' } },
      { element: '.el-table', popover: { title: '业务数据', description: '这里展示了系统的核心业务数据。', side: 'top' } }
    ]

    const driverObj = driver({
      showProgress: true,
      nextBtnText: '下一步',
      prevBtnText: '上一步',
      doneBtnText: '完成',
      steps: steps
    })

    driverObj.drive()
  }

  return { startTutorial }
}
