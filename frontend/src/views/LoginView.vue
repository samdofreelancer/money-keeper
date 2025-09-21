<template>
  <div class="page-container">
    <div class="brand-section">
      <h1 class="brand-title">Money Keeper</h1>
      <p class="brand-subtitle">Your Personal Finance Management Solution</p>
    </div>

    <div class="auth-content">
      <div class="auth-card">
        <h2 class="title">Welcome Back</h2>
        <p class="description">Please login to continue</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              type="email"
              placeholder="Email"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Password"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <div class="form-actions">
            <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn" color="#67c23a">
              Login
            </el-button>
          </div>
        </el-form>

        <div class="social-divider">
          <span>Or login with</span>
        </div>

        <div class="social-buttons">
          <el-button class="social-btn google-btn">
            <img src="@/assets/google-icon.svg" alt="Google" class="social-icon" />
            Google
          </el-button>
          <el-button class="social-btn facebook-btn">
            <img src="@/assets/facebook-icon.svg" alt="Facebook" class="social-icon" />
            Facebook
          </el-button>
        </div>

        <div class="form-footer">
          Don't have an account? <router-link to="/register" class="auth-link">Register</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import '@/assets/auth.css';
import type { FormInstance, FormRules } from 'element-plus';
import { Message, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = ref({
  username: '',
  password: ''
});

const rules = ref<FormRules>({
  username: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
});

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const authStore = useAuthStore();
        await authStore.login(form.value.username, form.value.password);
        ElMessage.success('Login successful!');
        
        // Get redirect path from query parameters or use default
        const redirect = router.currentRoute.value.query.redirect as string || '/';
        router.push(redirect);
      } catch (error: any) {
        ElMessage.error(error.message || "Login failed");
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 40px;
}

.brand-section {
  text-align: center;
  margin-bottom: 40px;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--topcv-primary);
  margin: 0 0 8px 0;
}

.brand-subtitle {
  font-size: 18px;
  color: var(--topcv-text-secondary);
  margin: 0;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: auto;
  position: relative;
  top: 50%;
  transform: translateY(-55%); /* Slightly above center for visual balance */
}

.title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--topcv-primary);
  text-align: center;
}

.description {
  margin: 0 0 24px 0;
  color: var(--topcv-text-secondary);
  text-align: center;
  font-size: 16px;
}

.subtitle {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--topcv-text-primary);
  text-align: center;
}

.login-text {
  margin: 0 0 32px 0;
  color: var(--topcv-text-secondary);
  text-align: center;
  font-size: 15px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  padding-bottom: 8px;
  color: var(--el-text-color-primary);
}

:deep(.el-input__wrapper) {
  padding: 4px 12px;
}

:deep(.el-input__inner) {
  height: 38px;
}

.form-actions {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  height: 44px;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.form-footer a {
  color: var(--el-color-primary);
  text-decoration: none;
  margin-left: 4px;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
