import os
import re

path = '/workspace/frontend/src/layout/index.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add state variable for the drawer
if 'const showBusinessGuide = ref(false)' not in content:
    content = content.replace("const router = useRouter()", "const router = useRouter()\nconst showBusinessGuide = ref(false)")

# Add Guide to imports if not there
if 'Guide' not in content and '@element-plus/icons-vue' in content:
    content = content.replace("QuestionFilled", "QuestionFilled, Guide, DataLine, Connection, Filter, Operation, Monitor, ElementPlus, Link, Finished")

# Add the button next to tutorial-btn
new_btn = """
        <button class="business-guide-btn" @click="showBusinessGuide = true">
          <el-icon><Guide /></el-icon>
          业务全景向导
        </button>
        <button class="tutorial-btn" @click="startTutorial()">
"""
content = content.replace('<button class="tutorial-btn" @click="startTutorial()">', new_btn)

# Add Drawer to the template, just before closing </template>
drawer_html = """
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
"""
content = re.sub(r'(</template>)', drawer_html + r'\1', content, 1)

# Add CSS for the drawer
css_addition = """
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
"""

content = content.replace('</style>', css_addition + '\n</style>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Business Guide Drawer to Layout")
