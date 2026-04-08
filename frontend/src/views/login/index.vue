<template>
  <div class="login-container">
    <div class="login-box glass-panel">
      <div class="logo-area">
        <div class="brand-ring"></div>
        <h2>信创工业综合治理平台</h2>
        <p class="subtitle">Industrial Digital Twin & SCADA System</p>
      </div>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="form.username" type="text" class="dark-input" placeholder="请输入用户名 (默认: admin)" />
      </div>
      <div class="form-group">
        <label>密 码</label>
        <input v-model="form.password" type="password" class="dark-input" placeholder="请输入密码 (默认: admin123)" @keyup.enter="preLogin" />
      </div>
      <button class="login-btn neon-btn" :disabled="loading" @click="preLogin">
        {{ loading ? 'Authenticating...' : '进入系统 (Enter)' }}
      </button>
      <p class="error-msg" v-if="errorMsg"><el-icon><Warning /></el-icon> {{ errorMsg }}</p>
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
import Vcode from 'vue3-puzzle-vcode'; // 引入滑动验证码
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

// 错误次数记录 (模拟防暴破逻辑)
const errorCount = ref(0);

// 点击登录按钮或回车，首先进行初步校验，然后弹出验证码
const preLogin = () => {
  if (!form.username || !form.password) {
    errorMsg.value = '用户名或密码不能为空';
    return;
  }
  
  // 如果连续输错 3 次以上，可以加上锁定的逻辑
  if (errorCount.value >= 5) {
    errorMsg.value = '错误次数过多，账号已锁定，请稍后再试';
    return;
  }

  // 弹出滑动验证码
  isShowCaptcha.value = true;
};

// 验证码验证成功回调
const onCaptchaSuccess = async () => {
  isShowCaptcha.value = false;
  await handleLogin();
};

// 验证码关闭回调
const onCaptchaClose = () => {
  isShowCaptcha.value = false;
};

// 实际发送请求进行登录
const handleLogin = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';
    // 调用 Pinia 中的 login 动作（底层走 request.ts）
    await userStore.login(form);
    
    // 登录成功，跳转至大屏首页
    errorCount.value = 0; // 成功重置计数
    router.push('/dashboard');
  } catch (error: any) {
    errorCount.value += 1;
    errorMsg.value = error.message || '登录失败，请检查账号密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(circle at 50% 0%, #0a192f 0%, #020617 100%);
  background-size: cover;
  position: relative;
  overflow: hidden;
  font-family: "SF Pro Display", -apple-system, sans-serif;
}
.login-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}
.login-box {
  position: relative;
  z-index: 1;
  padding: 48px 40px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(8, 15, 30, 0.6);
  border: 1px solid rgba(0, 216, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 32px rgba(0, 216, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(20px);
}
.logo-area {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}
.brand-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(0, 216, 255, 0.3);
  border-top-color: #00d8ff;
  margin: 0 auto 20px;
  animation: spin 4s linear infinite;
  box-shadow: 0 0 15px rgba(0, 216, 255, 0.2);
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
h2 {
  color: #fff;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 216, 255, 0.3);
}
.subtitle {
  color: #00d8ff;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
  opacity: 0.8;
  font-family: "SF Mono", Consolas, monospace;
}
.form-group {
  width: 100%;
  margin-bottom: 24px;
}
label {
  display: block;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.login-btn {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 6px;
}
.error-msg {
  color: #ff3366;
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>
