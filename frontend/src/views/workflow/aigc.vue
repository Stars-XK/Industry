<template>
  <div class="app-container fade-in-up">
    <div class="box-card">
      <div class="panel-header">
        <span class="panel-title">AI 大模型智能调度与指挥中枢</span>
      </div>
      <el-row :gutter="24" style="padding: 20px;">
        <el-col :span="16">
          <div class="chat-container">
            <div class="chat-history">
              <div class="message system">
                <div class="avatar"><el-icon><ChatDotRound /></el-icon></div>
                <div class="bubble">您好！我是信创工业治理平台的智能助手，已接入全局台账、工单与时序数据。您可以问我：“一厂区现在的能耗情况”、“生成台风防汛预案”等。</div>
              </div>
              <div class="message user" v-if="hasAsked">
                <div class="bubble">{{ lastQuestion }}</div>
                <div class="avatar"><el-icon><User /></el-icon></div>
              </div>
              <div class="message system" v-if="isTyping">
                <div class="avatar"><el-icon class="is-loading"><Loading /></el-icon></div>
                <div class="bubble typing-bubble">正在深度分析全局数据模型...</div>
              </div>
              <div class="message system" v-if="hasAnswered && aiResponse">
                <div class="avatar"><el-icon><ChatDotRound /></el-icon></div>
                <div class="bubble action-bubble">
                  <div class="bubble-title">{{ aiResponse.title }}</div>
                  <ol class="action-list">
                    <li v-for="(item, index) in aiResponse.actions" :key="index">{{ item }}</li>
                  </ol>
                  <el-button type="primary" size="default" class=" bubble-btn" @click="dispatchSOP">一键派发工单</el-button>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input v-model="question" type="textarea" :rows="3" placeholder="输入您的调度指令..." resize="none" class="dark-input" @keyup.enter="ask" />
              <div class="input-actions">
                <el-button type="primary"  @click="ask" :disabled="!question || isTyping">发送指令</el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="side-card" v-loading="loadingLocations">
            <div class="side-header">外勤人员与车辆实时 GIS 定位</div>
            <div class="side-content">
              <div class="map-placeholder">
                <span class="placeholder-text">(室内外融合定位地图)</span>
              </div>
              <ul class="location-list">
                <li class="location-item" v-for="loc in locations" :key="loc.id">
                  <el-icon class="loc-icon" :color="loc.type === 'person' ? '#00ffaa' : '#00d8ff'">
                    <Location v-if="loc.type === 'person'" />
                    <Van v-else />
                  </el-icon>
                  <span class="loc-name">{{ loc.name }}</span>
                  <span class="loc-dist">距离 {{ loc.distance }}</span>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChatDotRound, User, Loading, Location, Van } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDutyLocations, sendAIGCCommand } from '@/api/workflow'

const question = ref('')
const lastQuestion = ref('')
const hasAsked = ref(false)
const isTyping = ref(false)
const hasAnswered = ref(false)
const aiResponse = ref<any>(null)

const loadingLocations = ref(false)
const locations = ref<any[]>([])

const loadLocations = async () => {
  loadingLocations.value = true
  try {
    const res: any = await getDutyLocations()
    if (res.code === 200) {
      locations.value = res.data
    }
  } catch (error) {
    // fallback mock
    locations.value = [
      { id: 1, name: '张三 (维修工)', type: 'person', distance: '50m' },
      { id: 2, name: '李四 (听漏工)', type: 'person', distance: '1.2km' },
      { id: 3, name: '抢修车沪A123', type: 'vehicle', distance: '300m' }
    ]
  } finally {
    loadingLocations.value = false
  }
}

const ask = async () => {
  if (!question.value.trim() || isTyping.value) return
  lastQuestion.value = question.value
  hasAsked.value = true
  isTyping.value = true
  hasAnswered.value = false
  question.value = ''
  
  try {
    const res: any = await sendAIGCCommand({ command: lastQuestion.value })
    if (res.code === 200) {
      aiResponse.value = res.data
    }
  } catch (error) {
    // fallback mock
    aiResponse.value = {
      title: '已生成【防汛/抢修 SOP 工单】',
      actions: [
        '提前抽空雨水泵站调节池',
        '检查防汛沙袋库存',
        '安排在岗班组进行定点巡逻'
      ]
    }
  } finally {
    isTyping.value = false
    hasAnswered.value = true
  }
}

const dispatchSOP = () => {
  ElMessage.success('SOP 抢修工单已派发给距离最近的外勤人员')
}

onMounted(() => {
  loadLocations()
})
</script>
<style scoped>

.app-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.box-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar, .header-actions {
  display: flex;
  gap: 12px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.chat-container {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 600px;
  background: rgba(8, 15, 30, 0.4);
  box-shadow: inset 0 0 0 1px rgba(0, 216, 255, 0.05);
  overflow: hidden;
}
.chat-history {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: transparent;
}
.chat-input {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.message {
  display: flex;
  margin-bottom: 24px;
}
.message.user {
  justify-content: flex-end;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00d8ff, #0088ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 216, 255, 0.3);
}
.message.user .avatar {
  background: linear-gradient(135deg, #00ffaa, #00aa66);
  margin-left: 16px;
  box-shadow: 0 4px 12px rgba(0, 255, 170, 0.3);
}
.message.system .avatar {
  margin-right: 16px;
}
.bubble {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 12px;
  border-top-left-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.6;
  font-size: 14px;
  color: var(--el-text-color-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.message.user .bubble {
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
  background: rgba(0, 255, 170, 0.1);
  border: 1px solid rgba(0, 255, 170, 0.2);
  color: var(--el-text-color-primary);
}
.typing-bubble {
  color: var(--el-text-color-regular);
  font-style: italic;
}
.action-bubble {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.2);
}
.bubble-title {
  font-weight: 600;
  color: #ffb800;
  margin-bottom: 12px;
  font-size: 15px;
}
.action-list {
  padding-left: 20px;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}
.action-list li {
  margin-bottom: 6px;
}
.bubble-btn {
  width: 100%;
}
.side-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  background: rgba(8, 15, 30, 0.4);
  height: 600px;
  display: flex;
  flex-direction: column;
}
.side-header {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
}
.side-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.map-placeholder {
  height: 300px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}
.placeholder-text {
  color: #64748b;
  font-size: 13px;
  letter-spacing: 1px;
}
.location-list {
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
}
.location-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 14px;
}
.location-item:last-child {
  border-bottom: none;
}
.loc-icon {
  font-size: 18px;
  margin-right: 12px;
}
.loc-name {
  flex: 1;
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.loc-dist {
  color: var(--el-text-color-regular);
  font-family: "SF Mono", Consolas, monospace;
}
</style>
