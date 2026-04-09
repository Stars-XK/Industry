<template>
  <div class="layout-wrapper">
    <!-- 全局底层地图占位 (模拟 3D/2D GIS 地图层) -->
    <div class="global-map-bg">
      <div class="map-grid-overlay"></div>
      <div class="map-text-watermark">底座 GIS/BIM 地图层</div>
    </div>

    <!-- 顶部导航栏 (渲染一级菜单) -->
    <header class="top-navbar glass-effect">
      <div class="logo-area">
        <span class="logo-icon">智</span>
        <span class="logo-text">{{ configStore.sysTitle || '信创工业治理' }}</span>
      </div>
      
      <!-- 一级菜单区域 -->
      <nav class="top-menu-list">
        <ul>
          <li
            v-for="(menu, index) in dynamicMenuTree"
            :key="menu.path || menu.name"
            class="top-menu-item"
            :class="{ active: isTopMenuActive(menu, index) }"
            @click="handleTopMenuClick(menu, index)"
          >
            <el-icon class="svg-icon-small" v-if="menu.icon"><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </li>
        </ul>
      </nav>

      <div class="user-info">
        
        <button class="business-guide-btn" @click="showBusinessGuide = true">
          <el-icon><Guide /></el-icon>
          业务全景向导
        </button>
        <button class="tutorial-btn" @click="startTutorial()">

          <el-icon><QuestionFilled /></el-icon>
          页面向导
        </button>
        <span>欢迎，{{ userStore.userInfo?.username || '本地开发模式' }}</span>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <div class="main-body">
      <!-- 侧边菜单栏 (渲染当前选中的一级菜单的子菜单，如果没有子菜单则不显示) -->
      <aside class="sidebar-container" :class="{ collapsed: isSidebarCollapsed }" v-if="currentSubMenus && currentSubMenus.length > 0">
        <div class="collapse-toggle" @click="isSidebarCollapsed = !isSidebarCollapsed">
          <el-icon><component :is="isSidebarCollapsed ? 'Expand' : 'Fold'" /></el-icon>
        </div>
        <nav class="side-menu-list">
          <ul>
            <li 
              v-for="(child, childIndex) in currentSubMenus" 
              :key="child.path"
              class="side-menu-item-wrapper"
              @mouseenter="hoverMenu = childIndex"
              @mouseleave="hoverMenu = null"
            >
              <div class="menu-icon-box" :class="{ active: currentPath === child.path }" @click="handleNavigate(child)" tabindex="0" @keydown.enter="handleNavigate(child)" @keydown.space.prevent="handleNavigate(child)">
                <el-icon class="svg-icon" v-if="child.icon"><component :is="child.icon" /></el-icon>
                <span class="menu-text" v-show="!isSidebarCollapsed">{{ child.name }}</span>
              </div>
              <!-- 悬浮 Tooltip (仅收起时显示) -->
              <div class="tooltip" v-show="isSidebarCollapsed && hoverMenu === childIndex">
                {{ child.name }}
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- 右侧内容区 -->
      <main class="main-container">
        <!-- 核心路由出口 (完全透明，由内部组件决定自己的面板大小和位置) -->
        <section class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </section>
      </main>
    </div>
  </div>

    <!-- 业务全景与数据流转向导抽屉 -->
    <el-drawer
      v-model="showBusinessGuide"
      title="业务全景与数据治理向导 (Platform Workflow)"
      size="85%"
      :with-header="false"
      class="premium-drawer"
    >
      <div class="drawer-header">
        <h2>工业数据流转与平台治理全景图</h2>
        <p>理解数据从哪里来，到哪里去，如何被清洗，以及各个菜单是如何协同工作的。</p>
        <div class="close-btn" @click="showBusinessGuide = false"><el-icon><Close /></el-icon></div>
      </div>

      <div class="drawer-body">
        
        <!-- 核心业务管线流转图 -->
        <div class="guide-section">
          <div class="section-heading">
            <h3>1. 核心业务流转方向 (Data Pipeline & Quick Actions)</h3>
            <p>点击按钮可快速抵达对应业务菜单</p>
          </div>
          
          <div class="pipeline-track">
            <!-- Step 1 -->
            <div class="track-node">
              <div class="node-icon"><el-icon><ElementPlus /></el-icon></div>
              <div class="node-info">
                <h4>物理资产建档</h4>
                <p>将现实世界的水泵、阀门抽象为系统中的资产台账。这是所有业务的起点。</p>
                <div class="node-actions">
                  <el-button size="small" type="primary" plain @click="router.push('/system/asset'); showBusinessGuide=false">资产与设备台账</el-button>
                </div>
              </div>
            </div>
            
            <div class="track-connector"><el-icon><Right /></el-icon></div>

            <!-- Step 2 -->
            <div class="track-node">
              <div class="node-icon"><el-icon><Connection /></el-icon></div>
              <div class="node-info">
                <h4>异构数据池接入</h4>
                <p>通过边缘网关或直连甲方 PG 数据库等数仓，将海量原始 Tag 接入系统。</p>
                <div class="node-actions">
                  <el-button size="small" @click="router.push('/governance/integration'); showBusinessGuide=false">异构数据源接入</el-button>
                  <el-button size="small" @click="router.push('/system/gateway'); showBusinessGuide=false">网关状态监控</el-button>
                </div>
              </div>
            </div>

            <div class="track-connector"><el-icon><Right /></el-icon></div>

            <!-- Step 3 -->
            <div class="track-node">
              <div class="node-icon"><el-icon><Link /></el-icon></div>
              <div class="node-info">
                <h4>数字孪生映射</h4>
                <p>将外部杂乱的 Tag (如 PLC_Tag_01) 映射到我们在第一步建好的资产属性上。</p>
                <div class="node-actions">
                  <el-button size="small" type="primary" plain @click="router.push('/system/tag-mapping'); showBusinessGuide=false">传感器健康度评估</el-button>
                </div>
              </div>
            </div>

            <div class="track-connector"><el-icon><Right /></el-icon></div>

            <!-- Step 4 -->
            <div class="track-node highlight-node">
              <div class="node-icon"><el-icon><Filter /></el-icon></div>
              <div class="node-info">
                <h4>数据融合清洗与插值</h4>
                <p>脏数据洗屏、死值剔除与缺失值插补，形成高质量黄金数据集。</p>
                <div class="node-actions">
                  <el-button size="small" type="primary" @click="router.push('/governance/interpolate'); showBusinessGuide=false">插值容错规则</el-button>
                  <el-button size="small" @click="router.push('/governance/revenue'); showBusinessGuide=false">营收错期分摊</el-button>
                </div>
              </div>
            </div>

            <div class="track-connector"><el-icon><Right /></el-icon></div>

            <!-- Step 5 -->
            <div class="track-node">
              <div class="node-icon"><el-icon><Monitor /></el-icon></div>
              <div class="node-info">
                <h4>组态应用与决策</h4>
                <p>在前端画布或分析大屏中，消费已经被清洗好的高质量黄金数据。</p>
                <div class="node-actions">
                  <el-button size="small" type="primary" plain @click="router.push('/scada/topology'); showBusinessGuide=false">SCADA 低代码组态</el-button>
                  <el-button size="small" @click="router.push('/analytics/mnf'); showBusinessGuide=false">夜间最小流量分析</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据清洗机制详解 -->
        <div class="guide-section two-columns">
          <div class="info-card">
            <div class="card-icon"><el-icon><Operation /></el-icon></div>
            <h3>数据怎么清洗？什么时间清洗？</h3>
            <div class="card-content">
              <p><strong>1. 流式实时清洗 (Real-time Streaming)：</strong></p>
              <p>通过 Flink/Kafka 等流处理引擎，在数据接入的瞬间（毫秒级），根据 <code>插值容错规则配置</code> 中设定的上下限阈值，直接丢弃超限的“死值”与“飞点”，并进行线性插值填补。</p>
              
              <p><strong>2. 批式定时清洗 (Batch Cron Jobs)：</strong></p>
              <p>主要针对 <strong>营收数据融合清洗 (错期分摊)</strong>。因为水表抄表日期可能不同（如有的1号抄，有的15号抄），系统会通过 Quartz 定时任务，在 <strong>每日凌晨 02:00</strong>，拉取昨日全量账单数据，按日均摊算法，将错期的水量平滑分摊到自然月中，对齐时间维度。</p>
              <el-button link type="primary" @click="router.push('/system/config'); showBusinessGuide=false">去修改全局定时任务时间 <el-icon><Right /></el-icon></el-button>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon"><el-icon><Finished /></el-icon></div>
            <h3>菜单层级与实体关联模型图</h3>
            <div class="card-content">
              <ul class="relation-list">
                <li>
                  <strong>组织架构 (Org)</strong>
                  <span><el-icon><Right /></el-icon> 决定了数据权限边界（如：A厂区只能看A厂区的数据）。关联菜单：<code>组织架构管理</code>, <code>角色与权限体系</code></span>
                </li>
                <li>
                  <strong>业务模型 (DMA/工艺组态)</strong>
                  <span><el-icon><Right /></el-icon> 资产的物理挂载容器。关联菜单：<code>DMA 拓扑树配置</code>, <code>低代码组态工作台</code></span>
                </li>
                <li>
                  <strong>规则引擎 (Rules)</strong>
                  <span><el-icon><Right /></el-icon> 监听清洗后数据，触发报警。关联菜单：<code>报警联锁与因果矩阵引擎</code>, <code>报警风暴收敛中心</code></span>
                </li>
                <li>
                  <strong>闭环派单 (Workflow)</strong>
                  <span><el-icon><Right /></el-icon> 报警产生后，结合SOP生成工单。关联菜单：<code>运维工单流转大盘</code>, <code>SOP应急预案库</code></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';

import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { useConfigStore } from '@/store/config';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useTutorial } from '@/hooks/useTutorial';

const { startTutorial } = useTutorial();

const router = useRouter()
const showBusinessGuide = ref(false);
const route = useRoute();
const userStore = useUserStore();
const configStore = useConfigStore();

const currentPath = ref(route.path);
const hoverMenu = ref<any>(null);
const activeTopMenuIndex = ref<number>(0);
const isSidebarCollapsed = ref<boolean>(false);

// 监听路由变化
watch(() => route.path, (newPath) => {
  currentPath.value = newPath;
  updateActiveTopMenuByPath(newPath);
});

// SVG 图标集合
const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  scada: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  analytics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  workflow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><polyline points="9 14 12 17 18 10"></polyline></svg>`,
  governance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
  system: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  defaultSub: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
  // === 子菜单专用图标 ===
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12A10 10 0 1 0 22 12A10 10 0 1 0 2 12Z"></path><path d="M12 8v4l3 3"></path></svg>`,
  topology: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
  hmi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  security: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  pieChart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
  trend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  userAvatar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  money: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  lightning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
  opportunity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  guide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  management: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
  operation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  shoppingCart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  officeBuilding: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`,
  collection: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  documentChecked: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg>`,
  brush: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`
};

const dynamicMenuTree = computed(() => {
  const menus = userStore.menus || [];
  
  // Create static base
  const tree: any[] = [
    { name: '数字大屏', path: '/dashboard', icon: 'Odometer' }
  ];

  // Map backend menus to frontend structure
  menus.forEach(menu => {
    if (menu.menu_type === 'M' && menu.visible) {
      const treeNode = {
        name: menu.menu_name,
        icon: menu.icon || 'Menu',
        children: menu.children?.filter((c: any) => c.visible && c.menu_type === 'C').map((child: any) => {
          const fullPath = `${menu.path}/${child.path}`.replace(/\/\//g, '/').replace(/^\//, '');
          return {
            name: child.menu_name,
            path: `/${fullPath}`,
            icon: child.icon || 'Document'
          };
        }) || []
      };
      
      tree.push(treeNode);
    }
  });

  return tree;
});

// 获取当前选中一级菜单的子菜单列表
const currentSubMenus = computed(() => {
  return dynamicMenuTree.value[activeTopMenuIndex.value]?.children || [];
});

// 根据当前路由路径更新顶部一级菜单的激活状态
const updateActiveTopMenuByPath = (path: string) => {
  const index = dynamicMenuTree.value.findIndex(menu => {
    if (menu.path === path) return true;
    if (menu.children && menu.children.some((child: any) => child.path === path)) return true;
    // 处理带参数的子路由匹配
    if (menu.children && menu.children.some((child: any) => path.startsWith(child.path))) return true;
    return false;
  });
  if (index !== -1) {
    activeTopMenuIndex.value = index;
  }
};

const isTopMenuActive = (menu: any, index: number) => {
  return activeTopMenuIndex.value === index;
};

// 点击一级菜单：如果有子菜单则默认跳转到第一个子菜单；如果没有则直接跳转
const handleTopMenuClick = (menu: any, index: number) => {
  activeTopMenuIndex.value = index;
  if (menu.children && menu.children.length > 0) {
    const firstChildPath = menu.children[0].path;
    router.push(firstChildPath);
  } else if (menu.path) {
    router.push(menu.path);
  }
};

// 点击二级菜单
const handleNavigate = (child: any) => {
  if (child.path) {
    router.push(child.path);
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

// 初始化时同步路由和菜单状态
onMounted(() => {
  updateActiveTopMenuByPath(route.path);
});
</script>

<style scoped>
.layout-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}
/* 全局底层地图层 */
.global-map-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: var(--el-bg-color-page);
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-grid-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    linear-gradient(var(--el-border-color-light) 1px, transparent 1px),
    linear-gradient(90deg, var(--el-border-color-light) 1px, transparent 1px);
  background-size: 40px 40px;
}
.map-text-watermark {
  color: var(--el-text-color-disabled);
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 10px;
  pointer-events: none;
  user-select: none;
  opacity: 0.3;
}
/* 顶部导航栏 (包含一级菜单) */
.top-navbar {
  position: relative;
  z-index: 10;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  pointer-events: auto;
}
.glass-effect {
  background: var(--el-bg-color-overlay);
  backdrop-filter: blur(12px);
  color: var(--el-text-color-primary);
}
.logo-area {
  display: flex;
  align-items: center;
  margin-right: 40px;
}
.logo-icon {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-right: 10px;
  text-shadow: 0 0 10px var(--el-color-primary-light-5);
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--el-text-color-primary);
}
.top-menu-list {
  flex: 1;
  display: flex;
  align-items: center;
}
.top-menu-list ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
}
.top-menu-item {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s, opacity 0.3s;
  border-bottom: 2px solid transparent;
}
.top-menu-item:hover {
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
}
.top-menu-item.active {
  color: var(--el-color-primary);
  border-bottom: 2px solid var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
.svg-icon-small {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
:deep(.svg-icon-small svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.tutorial-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s, opacity 0.2s;
}

.tutorial-btn:hover {
  background: var(--el-color-primary-light-8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--el-color-primary-light-5);
}
.logout-btn {
  margin-left: 15px;
  padding: 6px 14px;
  background-color: transparent;
  color: var(--el-color-danger);
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.3s, opacity 0.3s;
  font-weight: 500;
}
.logout-btn:hover {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
  box-shadow: 0 0 10px var(--el-color-danger-light-5);
}
/* 主体区域：左侧边栏 + 右侧内容 */
.main-body {
  flex: 1;
  display: flex;
  position: relative;
  z-index: 5;
  overflow: hidden;
  height: calc(100vh - 60px);
}
/* 左侧边栏 (渲染二级菜单，小图标模式) */
.sidebar-container {
  position: relative;
  z-index: 10;
  width: 220px;
  background-color: var(--el-bg-color-overlay);
  backdrop-filter: blur(12px);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  transition: width 0.3s ease;
}
.sidebar-container.collapsed {
  width: 64px;
}
.collapse-toggle {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-light);
  transition: color 0.3s;
}
.collapse-toggle:hover {
  color: var(--el-color-primary);
}
.side-menu-list {
  flex: 1;
  padding-top: 15px;
  overflow-y: auto;
}
.side-menu-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.side-menu-item-wrapper {
  position: relative;
  margin-bottom: 12px;
  padding: 0 8px;
}
.menu-icon-box {
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: background-color 0.3s, color 0.3s, padding 0.3s, justify-content 0.3s;
}
.sidebar-container.collapsed .menu-icon-box {
  justify-content: center;
  padding: 0;
}
.menu-text {
  margin-left: 12px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.menu-icon-box:hover {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}
.menu-icon-box.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-color-primary-light-5);
}
.svg-icon {
  width: 22px;
  height: 22px;
}
:deep(.svg-icon svg) {
  width: 100%;
  height: 100%;
  display: block;
}
/* 悬浮 Tooltip */
.tooltip {
  position: absolute;
  left: 70px;
  top: 10px;
  background-color: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow);
}
.tooltip::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent var(--el-border-color-light) transparent transparent;
}
/* 右侧内容区 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto;
  overflow: hidden;
  height: 100%;
}
/* 核心路由层: 各个业务组件在这里决定自己的尺寸和位置 */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
  pointer-events: auto;
  overflow: hidden;
  height: 100%;
}
/* 兼容老页面的业务容器 (新页面建议使用 .premium-container) */

/* Business Guide Drawer */
:deep(.premium-drawer .el-drawer__body) {
  padding: 0;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 40px 60px 30px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.drawer-header h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  letter-spacing: -0.5px;
}

.drawer-header p {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 32px;
  right: 40px;
  font-size: 24px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
  background: var(--el-fill-color-light);
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.close-btn:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }

.drawer-body {
  padding: 40px 60px;
  overflow-y: auto;
  flex: 1;
}

.guide-section {
  margin-bottom: 48px;
}

.section-heading {
  margin-bottom: 32px;
}

.section-heading h3 {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.section-heading p {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

/* Pipeline Track */
.pipeline-track {
  display: flex;
  align-items: stretch;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--el-box-shadow-light);
  overflow-x: auto;
}

.track-node {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s;
}

.track-node:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
  transform: translateY(-4px);
}

.track-node.highlight-node {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
html.dark .track-node.highlight-node {
  background: var(--el-color-primary-dark-2);
  border-color: var(--el-color-primary);
}

.node-icon {
  width: 48px; height: 48px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}
html.dark .node-icon { background: var(--el-color-primary-dark-2); }

.node-info h4 { margin: 0 0 12px 0; font-size: 16px; color: var(--el-text-color-primary); }
.node-info p { margin: 0 0 20px 0; font-size: 13px; color: var(--el-text-color-regular); line-height: 1.6; flex: 1; }

.node-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.node-actions .el-button { margin-left: 0 !important; width: 100%; justify-content: center; }

.track-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: var(--el-border-color-darker);
  font-size: 24px;
}

/* Two Columns Info */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.info-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--el-box-shadow-light);
}

.card-icon {
  width: 40px; height: 40px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  margin-bottom: 20px;
}

.info-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
}

.card-content p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-content strong {
  color: var(--el-text-color-primary);
}

.relation-list {
  list-style: none;
  padding: 0; margin: 0;
}

.relation-list li {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.relation-list li:last-child { border-bottom: none; }

.relation-list strong {
  font-size: 15px;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.relation-list span {
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: flex-start;
  line-height: 1.5;
}
.relation-list span .el-icon { margin-right: 6px; margin-top: 2px; }
.relation-list code {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--el-text-color-primary);
  font-family: monospace;
  margin: 0 4px;
}

.business-guide-btn {
  background-color: var(--el-color-primary);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 12px;
  font-weight: 500;
}
.business-guide-btn:hover { background-color: var(--el-color-primary-light-3); transform: translateY(-1px); }

</style>

<style>
/* 页面过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: background-color 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), color 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

/* Business Guide Drawer */
:deep(.premium-drawer .el-drawer__body) {
  padding: 0;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 40px 60px 30px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.drawer-header h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  letter-spacing: -0.5px;
}

.drawer-header p {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 32px;
  right: 40px;
  font-size: 24px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
  background: var(--el-fill-color-light);
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.close-btn:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }

.drawer-body {
  padding: 40px 60px;
  overflow-y: auto;
  flex: 1;
}

.guide-section {
  margin-bottom: 48px;
}

.section-heading {
  margin-bottom: 32px;
}

.section-heading h3 {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.section-heading p {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

/* Pipeline Track */
.pipeline-track {
  display: flex;
  align-items: stretch;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--el-box-shadow-light);
  overflow-x: auto;
}

.track-node {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s;
}

.track-node:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
  transform: translateY(-4px);
}

.track-node.highlight-node {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
html.dark .track-node.highlight-node {
  background: var(--el-color-primary-dark-2);
  border-color: var(--el-color-primary);
}

.node-icon {
  width: 48px; height: 48px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}
html.dark .node-icon { background: var(--el-color-primary-dark-2); }

.node-info h4 { margin: 0 0 12px 0; font-size: 16px; color: var(--el-text-color-primary); }
.node-info p { margin: 0 0 20px 0; font-size: 13px; color: var(--el-text-color-regular); line-height: 1.6; flex: 1; }

.node-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.node-actions .el-button { margin-left: 0 !important; width: 100%; justify-content: center; }

.track-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: var(--el-border-color-darker);
  font-size: 24px;
}

/* Two Columns Info */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.info-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--el-box-shadow-light);
}

.card-icon {
  width: 40px; height: 40px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  margin-bottom: 20px;
}

.info-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
}

.card-content p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-content strong {
  color: var(--el-text-color-primary);
}

.relation-list {
  list-style: none;
  padding: 0; margin: 0;
}

.relation-list li {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.relation-list li:last-child { border-bottom: none; }

.relation-list strong {
  font-size: 15px;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.relation-list span {
  font-size: 13px;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: flex-start;
  line-height: 1.5;
}
.relation-list span .el-icon { margin-right: 6px; margin-top: 2px; }
.relation-list code {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--el-text-color-primary);
  font-family: monospace;
  margin: 0 4px;
}

.business-guide-btn {
  background-color: var(--el-color-primary);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 12px;
  font-weight: 500;
}
.business-guide-btn:hover { background-color: var(--el-color-primary-light-3); transform: translateY(-1px); }

</style>
