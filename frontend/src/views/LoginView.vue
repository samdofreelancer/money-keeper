<template>
  <div class="page-container">
    <div class="brand-section">
      <h1 class="brand-title">Money Keeper</h1>
      <p class="brand-subtitle">Your Personal Finance Management Solution</p>
    </div>

    <div class="auth-content">
      <div class="auth-card">
        <h2 class="title">Welcome back!</h2>
        <p class="description">Sign in to manage your finances with ease</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleLogin"
          aria-label="Login form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              type="email"
              placeholder="Enter your email"
              prefix-icon="Message"
              aria-label="Email input"
            />
          </el-form-item>

          <el-form-item prop="password" class="password-field">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              prefix-icon="Lock"
              show-password
              aria-label="Password input"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-options">
            <div class="form-options-row">
              <el-checkbox 
                v-model="rememberMe" 
                class="remember-me" 
                size="large"
                aria-label="Remember me checkbox"
              >
                Remember me
              </el-checkbox>
              <el-link 
                type="primary" 
                class="forgot-password-link" 
                @click="handleForgotPassword"
                aria-label="Forgot password link"
              >
                Forgot password?
              </el-link>
            </div>
          </div>

          <div class="primary-action">
            <el-button 
              type="primary" 
              native-type="submit" 
              :loading="loading" 
              class="submit-btn" 
              :disabled="loading"
              @click="handleLogin"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </el-button>
          </div>

          <div class="divider-section">
            <div class="divider-line"></div>
            <span class="divider-text">Or continue with</span>
            <div class="divider-line"></div>
          </div>

          <div class="social-section">
            <el-button 
              class="social-btn google-btn" 
              :loading="googleLoading"
              size="large"
              aria-label="Sign in with Google"
            >
              <img src="@/assets/google-icon.svg" alt="" class="social-icon" />
              Continue with Google
            </el-button>
            <el-button 
              class="social-btn facebook-btn" 
              :loading="facebookLoading"
              size="large"
              aria-label="Sign in with Facebook"
            >
              <img src="@/assets/facebook-icon.svg" alt="" class="social-icon" />
              Continue with Facebook
            </el-button>
          </div>
        </el-form>

        <div class="form-footer">
          <span>New to Money Keeper?</span>
          <router-link to="/register" class="auth-link">Create an account</router-link>
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
const googleLoading = ref(false);
const facebookLoading = ref(false);
const rememberMe = ref(false);

const form = ref({
  username: '',
  password: ''
});

const handleForgotPassword = () => {
  // Implement forgot password functionality
  ElMessage({
    message: 'Password reset link will be sent to your email',
    type: 'info'
  });
};

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
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  margin: auto;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.auth-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

:deep(.el-form-item__error) {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 4px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px !important;
  padding: 4px 12px !important;
  background-color: white !important; /* Changed to white */
  border: 1px solid #d1d5db !important; /* border-gray-300 */
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: #9ca3af !important; /* gray-400 for hover */
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #22c55e !important; /* green-500 */
  box-shadow: 0 0 0 2px #22c55e !important; /* focus:ring-2 focus:ring-green-500 */
}

:deep(.el-input__inner) {
  height: 40px !important;
  font-size: 15px !important;
  color: var(--topcv-text-primary) !important;
}

.button-container {
  margin: 24px 0;
  width: 100%;
}

.submit-btn {
  width: 100% !important;
  height: 48px !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  background-color: var(--topcv-primary) !important;
  border-color: var(--topcv-primary) !important;
  color: #ffffff !important;
  display: block !important;
  margin: 0 auto !important;
  position: relative !important;
  z-index: 2 !important;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--topcv-primary-hover) !important;
  border-color: var(--topcv-primary-hover) !important;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  color: #6b7280; /* Lighter gray */
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
  color: #3b82f6; /* Tailwind blue-500 */
  text-decoration: none;
  margin-left: 4px;
  font-weight: bold; /* Added bold */
}

.form-footer a:hover {
  text-decoration: underline;
}

.password-field {
  margin-bottom: 20px !important; /* Increased by 8px */
}

.form-options {
  margin-bottom: 12px;
}

.form-options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-btn {
  width: 100%;
  height: 48px !important;
  margin-bottom: 24px; /* Increased by 12px */
  font-size: 16px;
  font-weight: bold; /* Changed to bold */
  border-radius: 8px;
  background-color: #22c55e !important; /* Tailwind green-500 */
  border-color: #22c55e !important; /* Tailwind green-500 */
  color: white !important;
  z-index: 1;
  position: relative;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #16a34a !important; /* Tailwind green-700 */
  border-color: #16a34a !important; /* Tailwind green-700 */
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

:deep(.remember-me) {
  margin-right: 8px;
}

:deep(.remember-me .el-checkbox__label) {
  font-size: 14px;
  color: var(--topcv-text-secondary);
  padding-left: 8px;
}

:deep(.remember-me .el-checkbox__inner) {
  width: 18px;
  height: 18px;
}

.forgot-password-link {
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: #3b82f6; /* Tailwind blue-500 */
  transition: all 0.2s ease;
}

.forgot-password-link:hover {
  opacity: 0.85;
  text-decoration: underline;
}

.primary-button {
  height: 48px !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  background-color: var(--topcv-primary) !important;
  border-color: var(--topcv-primary) !important;
  transition: all 0.2s ease !important;
  width: 100% !important;
  letter-spacing: 0.3px !important;
}

.primary-button:hover:not(:disabled) {
  background-color: var(--topcv-primary-hover) !important;
  border-color: var(--topcv-primary-hover) !important;
  transform: translateY(-1px);
}

.divider-section {
  display: flex;
  align-items: center;
  margin: 36px 0;
  gap: 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--topcv-border);
}

.divider-text {
  color: var(--topcv-text-secondary);
  font-size: 14px;
  white-space: nowrap;
  padding: 0 16px;
}

.social-section {
  display: flex;
  flex-direction: row; /* Changed to row for desktop */
  gap: 16px;
  margin-bottom: 32px;
}

.social-btn {
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 16px !important; /* Increased by 4px */
  border: 1px solid var(--topcv-border) !important;
  background: white !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: var(--topcv-text-primary) !important;
  transition: all 0.2s ease !important;
  border-radius: 8px !important;
  width: 100% !important;
}

.social-btn:hover {
  background: var(--topcv-background) !important;
  border-color: var(--topcv-text-secondary) !important;
}

.social-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Mobile styles */
@media (max-width: 480px) {
  .auth-card {
    padding: 24px;
    margin: 16px;
    max-width: calc(100% - 32px);
  }
  
  .title {
    font-size: 24px;
  }
  
  .description {
    font-size: 15px;
  }

  .form-options {
    margin-bottom: 24px;
  }

  .form-options-row {
    margin-bottom: 20px;
  }

  .forgot-password-link {
    font-size: 13px;
  }

  :deep(.remember-me .el-checkbox__label) {
    font-size: 13px;
  }

  .divider-section {
    margin: 24px 0;
    gap: 12px;
  }

  .divider-text {
    font-size: 13px;
  }
  
  .social-section {
    flex-direction: column; /* Stack vertically on mobile */
    gap: 12px; /* Adjusted to 12px for mobile */
  }

  .primary-button {
    height: 44px !important;
    font-size: 15px !important;
  }

  .social-btn {
    height: 44px !important;
    font-size: 14px !important;
  }
}
</style>
