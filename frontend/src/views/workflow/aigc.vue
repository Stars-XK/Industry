<template>
  <div class="page-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">AI 大模型智能调度与指挥中枢</div>
        </div>
      </template>
      <el-row :gutter="24">
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
                  <el-button type="primary" size="default" class="bubble-btn">一键派发工单</el-button>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input v-model="question" type="textarea" :rows="3" placeholder="输入您的调度指令..." resize="none" />
              <div class="input-actions">
                <el-button type="primary" @click="ask" :disabled="!question">发送指令</el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <el-card header="外勤人员与车辆实时 GIS 定位" shadow="never" class="side-card">
            <div class="map-placeholder">
              <span class="placeholder-text">(室内外融合定位地图)</span>
            </div>
            <ul class="location-list">
              <li class="location-item">
                <el-icon class="loc-icon" color="#67C23A"><Location /></el-icon> 
                <span class="loc-name">张三 (维修工)</span>
                <span class="loc-dist">距离 50m</span>
              </li>
              <li class="location-item">
                <el-icon class="loc-icon" color="#E6A23C"><Location /></el-icon> 
                <span class="loc-name">李四 (听漏工)</span>
                <span class="loc-dist">距离 1.2km</span>
              </li>
              <li class="location-item">
                <el-icon class="loc-icon" color="#409EFF"><Van /></el-icon> 
                <span class="loc-name">抢修车沪A123</span>
                <span class="loc-dist">距离 300m</span>
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
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
.page-container {
  padding: 24px;
  background: #f4f6f8;
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.box-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.chat-container {
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 600px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
  overflow: hidden;
}

.chat-history {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #fafbfc;
}

.chat-input {
  padding: 20px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,0.05);
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
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(64,158,255,0.3);
}

.message.user .avatar {
  background: linear-gradient(135deg, #67C23A, #5daf34);
  margin-left: 16px;
  box-shadow: 0 4px 12px rgba(103,194,58,0.3);
}

.message.system .avatar {
  margin-right: 16px;
}

.bubble {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 12px;
  border-top-left-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  line-height: 1.6;
  font-size: 14px;
  color: #303133;
  border: 1px solid rgba(0,0,0,0.02);
}

.message.user .bubble {
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  color: #274c17;
}

.typing-bubble {
  color: #909399;
  font-style: italic;
}

.action-bubble {
  background: #fdf6ec;
  border: 1px solid #faecd8;
}

.bubble-title {
  font-weight: 600;
  color: #E6A23C;
  margin-bottom: 12px;
  font-size: 15px;
}

.action-list {
  padding-left: 20px;
  margin-bottom: 16px;
  color: #606266;
}

.action-list li {
  margin-bottom: 6px;
}

.bubble-btn {
  width: 100%;
}

.side-card {
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
}

:deep(.side-card .el-card__header) {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 14px;
  color: #606266;
}

.map-placeholder {
  height: 300px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.placeholder-text {
  color: #909399;
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
  border-bottom: 1px solid #f0f2f5;
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
  color: #303133;
  font-weight: 500;
}

.loc-dist {
  color: #909399;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}
</style>
