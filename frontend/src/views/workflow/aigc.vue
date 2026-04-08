<template>
  <div class="premium-container fade-in-up">
    <div class="glass-panel hover-lift">
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
                <div class="bubble">请帮我生成一份关于明日暴雨预警的防汛前置工单，并指派给在岗班组。</div>
                <div class="avatar"><el-icon><User /></el-icon></div>
              </div>
              <div class="message system" v-if="isTyping">
                <div class="avatar"><el-icon class="is-loading"><Loading /></el-icon></div>
                <div class="bubble typing-bubble">正在分析气象数据、人员排班与物资库存...</div>
              </div>
              <div class="message system" v-if="hasAnswered">
                <div class="avatar"><el-icon><ChatDotRound /></el-icon></div>
                <div class="bubble action-bubble">
                  <div class="bubble-title">已生成【台风红色预警防汛SOP工单】</div>
                  <ol class="action-list">
                    <li>提前抽空雨水泵站调节池</li>
                    <li>检查 100 只防汛沙袋库存是否充足</li>
                    <li>安排夜班 A 组（张三、李四）定点巡逻</li>
                  </ol>
                  <el-button type="primary" size="default" class="neon-btn bubble-btn">一键派发工单</el-button>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input v-model="question" type="textarea" :rows="3" placeholder="输入您的调度指令..." resize="none" class="dark-input" />
              <div class="input-actions">
                <el-button type="primary" class="neon-btn" @click="ask" :disabled="!question">发送指令</el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="side-card">
            <div class="side-header">外勤人员与车辆实时 GIS 定位</div>
            <div class="side-content">
              <div class="map-placeholder">
                <span class="placeholder-text">(室内外融合定位地图)</span>
              </div>
              <ul class="location-list">
                <li class="location-item">
                  <el-icon class="loc-icon" color="#00ffaa"><Location /></el-icon>
                  <span class="loc-name">张三 (维修工)</span>
                  <span class="loc-dist">距离 50m</span>
                </li>
                <li class="location-item">
                  <el-icon class="loc-icon" color="#ffb800"><Location /></el-icon>
                  <span class="loc-name">李四 (听漏工)</span>
                  <span class="loc-dist">距离 1.2km</span>
                </li>
                <li class="location-item">
                  <el-icon class="loc-icon" color="#00d8ff"><Van /></el-icon>
                  <span class="loc-name">抢修车沪A123</span>
                  <span class="loc-dist">距离 300m</span>
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
import { ref } from 'vue'
import { ChatDotRound, User, Loading, Location, Van } from '@element-plus/icons-vue'

const question = ref('')
const hasAsked = ref(false)
const isTyping = ref(false)
const hasAnswered = ref(false)

const ask = () => {
  if (!question.value) return
  hasAsked.value = true
  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    hasAnswered.value = true
    question.value = ''
  }, 1500)
}
</script>
<style scoped>
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
  color: #e2e8f0;
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
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.message.user .bubble {
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
  background: rgba(0, 255, 170, 0.1);
  border: 1px solid rgba(0, 255, 170, 0.2);
  color: #e2e8f0;
}
.typing-bubble {
  color: #94a3b8;
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
  color: #e2e8f0;
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
  color: #e2e8f0;
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
  color: #e2e8f0;
  font-weight: 500;
}
.loc-dist {
  color: #94a3b8;
  font-family: "SF Mono", Consolas, monospace;
}
</style>
