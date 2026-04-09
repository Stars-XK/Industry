<template>
  <div class="login-layout">
    <!-- Left Hero Section -->
    <div class="hero-section fade-in-up" style="animation-delay: 0.1s;">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="brand-badge">信创工业底座</div>
        <h1 class="hero-title">工业数字孪生<br />与 SCADA 监控系统</h1>
        <p class="hero-desc">面向关键基础设施的新一代治理平台。<br />由高级分析、人工智能和实时遥测技术驱动。</p>

        <div class="system-stats">
          <div class="stat-item">
            <span class="stat-value">99.99%</span>
            <span class="stat-label">系统正常运行时间</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">&lt;50ms</span>
            <span class="stat-label">遥测延迟</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">TLS 1.3</span>
            <span class="stat-label">端到端加密</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Form Section -->
    <div class="form-section fade-in-up" style="animation-delay: 0.2s;">
      <div class="form-wrapper">
        <div class="form-header">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00d8ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#00d8ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#00d8ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>控制中心登录</h2>
          <p>请进行身份验证以访问治理看板。</p>
        </div>

        <form class="login-form" @submit.prevent="preLogin">
          <div class="input-group">
            <label>用户名</label>
            <div class="input-field">
              <input v-model="form.username" type="text" placeholder="请输入用户名" autocomplete="username" />
            </div>
          </div>

          <div class="input-group">
            <div class="label-row">
              <label>密码</label>
              <a href="#" class="forgot-link" @click.prevent>忘记密码？</a>
            </div>
            <div class="input-field">
              <input v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password" />
            </div>
          </div>

          <div class="error-banner" v-if="errorMsg">
            <el-icon><Warning /></el-icon>
            <span>{{ errorMsg }}</span>
          </div>

          <button type="submit" class="submit-btn pulse-glow" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>登录系统</span>
          </button>
        </form>

        <div class="form-footer">
          <p>严禁未经授权的访问。所有操作均由安全审计引擎记录和监控。</p>
        </div>
      </div>
    </div>

    <!-- 滑动拼图验证码 -->
    <Vcode
      :show="isShowCaptcha"
      @success="onCaptchaSuccess"
      @close="onCaptchaClose"
      title="安全验证通过"
      successText="验证通过"
      failText="验证失败"
      sliderText="向右滑动以完成验证"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import Vcode from 'vue3-puzzle-vcode';
import { Warning } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const errorMsg = ref('');
const isShowCaptcha = ref(false);
const errorCount = ref(0);

const preLogin = () => {
  if (!form.username || !form.password) {
    errorMsg.value = '用户名或密码不能为空';
    return;
  }
  if (errorCount.value >= 5) {
    errorMsg.value = '错误次数过多，账号已锁定，请稍后再试';
    return;
  }
  isShowCaptcha.value = true;
};

const onCaptchaSuccess = async () => {
  isShowCaptcha.value = false;
  await handleLogin();
};

const onCaptchaClose = () => {
  isShowCaptcha.value = false;
};

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';
    const success = await userStore.login(form);
    
    if (success) {
      errorCount.value = 0;
      router.push('/dashboard');
    } else {
      throw new Error('身份验证失败');
    }
  } catch (error: any) {
    errorCount.value += 1;
    errorMsg.value = error.message || '登录失败，请检查账号密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
}

/* --- Left Hero Section --- */
.hero-section {
  flex: 1.2;
  position: relative;
  background-image: url('https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20industrial%20digital%20twin%20SCADA%20control%20room%20with%20glowing%20blue%20data%20visualizations%2C%20cinematic%20lighting%2C%208k%2C%20photorealistic%2C%20highly%20detailed%2C%20premium&image_size=landscape_16_9');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 80px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--el-bg-color) 0%, transparent 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.brand-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(0, 216, 255, 0.1);
  border: 1px solid rgba(0, 216, 255, 0.3);
  color: var(--el-color-primary);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 56px;
  line-height: 1.1;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: var(--el-text-color-primary)fff;
  letter-spacing: -1px;
}

.hero-desc {
  font-size: 18px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin: 0 0 48px 0;
  max-width: 600px;
}

.system-stats {
  display: flex;
  gap: 48px;
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-family: "SF Mono", Consolas, monospace;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* --- Right Form Section --- */
.form-section {
  flex: 0.8;
  min-width: 480px;
  max-width: 600px;
  background-color: #040914;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border-left: 1px solid var(--el-border-color-light);
}

.form-wrapper {
  width: 100%;
  max-width: 380px;
}

.form-header {
  margin-bottom: 48px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  background: rgba(0, 216, 255, 0.05);
  border: 1px solid rgba(0, 216, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.brand-logo svg {
  width: 24px;
  height: 24px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.form-header p {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.forgot-link {
  font-size: 13px;
  color: var(--el-color-primary);
  text-decoration: none;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.8;
}

.input-field input {
  width: 100%;
  background: var(--el-bg-color);
  border: 1px solid #1e293b;
  color: var(--el-text-color-primary);
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 15px;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
  box-sizing: border-box;
}

.input-field input:focus {
  outline: 2px solid transparent; outline-offset: 2px;;
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(0, 216, 255, 0.1);
  background: #152038;
}

.input-field input::placeholder {
  color: #475569;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  color: var(--el-color-danger);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.submit-btn {
  background: var(--el-color-primary);
  color: var(--el-text-color-primary);
  border: none;
  border-radius: 8px;
  width: 100%;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 1px solid var(--el-border-color-light);
  border-top-color: #020617;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-light);
}

.form-footer p {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .hero-section {
    display: none;
  }
  .form-section {
    flex: 1;
    max-width: 100%;
    border-left: none;
  }
}
</style>
