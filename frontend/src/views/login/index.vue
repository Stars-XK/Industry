<template>
  <div class="login-layout">
    <!-- Left Hero Section -->
    <div class="hero-section fade-in-up" style="animation-delay: 0.1s;">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="brand-badge">信创工业底座</div>
        <h1 class="hero-title">Industrial Digital Twin<br />& SCADA System</h1>
        <p class="hero-desc">Next-generation governance platform for critical infrastructure. <br />Powered by advanced analytics, AI, and real-time telemetry.</p>
        
        <div class="system-stats">
          <div class="stat-item">
            <span class="stat-value">99.99%</span>
            <span class="stat-label">System Uptime</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">&lt; 10ms</span>
            <span class="stat-label">Telemetry Latency</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">AES-256</span>
            <span class="stat-label">End-to-End Encrypted</span>
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
          <h2>Control Center Access</h2>
          <p>Please authenticate to access the governance dashboard.</p>
        </div>

        <form class="login-form" @submit.prevent="preLogin">
          <div class="input-group">
            <label>Username</label>
            <div class="input-field">
              <input v-model="form.username" type="text" placeholder="admin" autocomplete="username" />
            </div>
          </div>

          <div class="input-group">
            <div class="label-row">
              <label>Password</label>
              <a href="#" class="forgot-link" @click.prevent>Forgot?</a>
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
            <span v-else>Authenticate</span>
          </button>
        </form>

        <div class="form-footer">
          <p>Unauthorized access is strictly prohibited. All actions are logged and monitored by the security audit engine.</p>
        </div>
      </div>
    </div>

    <!-- 滑动拼图验证码 -->
    <Vcode
      :show="isShowCaptcha"
      @success="onCaptchaSuccess"
      @close="onCaptchaClose"
      successText="Security Check Passed"
      failText="Verification Failed"
      sliderText="Slide to verify"
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
      throw new Error('Authentication failed');
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
  background-color: #020617;
  color: #f8fafc;
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
  background: linear-gradient(to top, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.4) 50%, rgba(2, 6, 23, 0.1) 100%);
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
  color: #00d8ff;
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
  color: #ffffff;
  letter-spacing: -1px;
}

.hero-desc {
  font-size: 18px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0 0 48px 0;
  max-width: 600px;
}

.system-stats {
  display: flex;
  gap: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #00d8ff;
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
  border-left: 1px solid rgba(255, 255, 255, 0.05);
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
  color: #f8fafc;
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
  color: #cbd5e1;
}

.forgot-link {
  font-size: 13px;
  color: #00d8ff;
  text-decoration: none;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.8;
}

.input-field input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #1e293b;
  color: #f8fafc;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-field input:focus {
  outline: none;
  border-color: #00d8ff;
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
  color: #f43f5e;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.submit-btn {
  background: #00d8ff;
  color: #020617;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #00eeff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 216, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(2, 6, 23, 0.3);
  border-top-color: #020617;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
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
