<template>
  <div class="login-container">
    <div class="login-box">
      <h2>信创工业综合治理平台</h2>
      <div class="form-group">
        <label>用户名：</label>
        <input v-model="form.username" type="text" placeholder="请输入用户名 (默认: admin)" />
      </div>
      <div class="form-group">
        <label>密 码：</label>
        <input v-model="form.password" type="password" placeholder="请输入密码 (默认: admin123)" @keyup.enter="preLogin" />
      </div>
      <button class="login-btn" :disabled="loading" @click="preLogin">
        {{ loading ? 'Thinking...' : '登 录' }}
      </button>
      <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
    </div>

    <!-- 滑动拼图验证码 -->
    <Vcode
      :show="isShowCaptcha"
      @success="onCaptchaSuccess"
      @close="onCaptchaClose"
      successText="验证成功！"
      failText="验证失败，请重试！"
      sliderText="向右拖动滑块填充拼图"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import Vcode from 'vue3-puzzle-vcode'; // 引入滑动验证码

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
  background: linear-gradient(135deg, #1d2b64 0%, #f8cdda 100%);
}
.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  width: 360px;
}
h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.login-btn:disabled {
  background-color: #9E9E9E;
}
.error-msg {
  color: red;
  text-align: center;
  margin-top: 15px;
}
</style>
