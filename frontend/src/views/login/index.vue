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
        <input v-model="form.password" type="password" placeholder="请输入密码 (默认: admin123)" @keyup.enter="handleLogin" />
      </div>
      <button class="login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
      <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/user';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  if (!form.username || !form.password) {
    errorMsg.value = '用户名或密码不能为空';
    return;
  }
  try {
    loading.value = true;
    errorMsg.value = '';
    // 调用 Pinia 中的 login 动作（底层走 request.ts）
    await userStore.login(form);
    
    // 登录成功，跳转至大屏首页
    router.push('/dashboard');
  } catch (error: any) {
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
