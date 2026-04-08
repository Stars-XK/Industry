<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>AI 大模型智能调度与指挥中枢</span>
      </div>
      <el-row :gutter="20">
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
                <div class="avatar"><el-icon><Loading /></el-icon></div>
                <div class="bubble">正在分析气象数据、人员排班与物资库存...</div>
              </div>
              <div class="message system" v-if="hasAnswered">
                <div class="avatar"><el-icon><ChatDotRound /></el-icon></div>
                <div class="bubble">
                  <strong>已生成【台风红色预警防汛SOP工单】：</strong><br>
                  1. 提前抽空雨水泵站调节池<br>
                  2. 检查 100 只防汛沙袋库存是否充足<br>
                  3. 安排夜班 A 组（张三、李四）定点巡逻<br>
                  <el-button type="primary" size="small" style="margin-top: 10px;">一键派发工单</el-button>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input v-model="question" type="textarea" :rows="3" placeholder="输入您的调度指令..." />
              <el-button type="success" style="margin-top: 10px; float: right;" @click="ask">发送</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <el-card header="外勤人员与车辆实时 GIS 定位" shadow="hover">
            <div style="height: 350px; background: #eef; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
              <span style="color: #666; font-size: 14px;">(室内外融合定位地图)</span>
            </div>
            <ul style="list-style: none; padding-left: 0; margin-top: 15px; font-size: 14px; color: #333;">
              <li><el-icon color="#67C23A"><Location /></el-icon> 张三 (维修工) - 距离 50m</li>
              <li><el-icon color="#E6A23C"><Location /></el-icon> 李四 (听漏工) - 距离 1.2km</li>
              <li><el-icon color="#409EFF"><Van /></el-icon> 抢修车沪A123 - 距离 300m</li>
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
.app-container { padding: 20px; }
.chat-container { border: 1px solid #dcdfe6; border-radius: 4px; display: flex; flex-direction: column; height: 500px; }
.chat-history { flex: 1; padding: 15px; overflow-y: auto; background-color: #f5f7fa; }
.chat-input { padding: 15px; background: #fff; border-top: 1px solid #dcdfe6; }
.message { display: flex; margin-bottom: 20px; }
.message.user { justify-content: flex-end; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #409EFF; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.message.user .avatar { background: #67C23A; margin-left: 15px; }
.message.system .avatar { margin-right: 15px; }
.bubble { max-width: 70%; padding: 10px 15px; border-radius: 4px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); line-height: 1.5; font-size: 14px; }
.message.user .bubble { background: #e1f3d8; }
</style>
