<template>
  <div class="page-container">
    <div class="brand-section">
      <h1 class="brand-title">Money Keeper</h1>
      <p class="brand-subtitle">Your Personal Finance Management Solution</p>
    </div>

    <div class="auth-content">
      <div class="auth-card">
        <h2 class="title">Create New Account</h2>
        <p class="description">Join us to manage your finances effectively</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleRegister"
          aria-label="Registration form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              type="email"
              placeholder="Enter your email"
              prefix-icon="Message"
              aria-label="Email input"
            />
            <div class="field-hint">We'll send a verification link to this email</div>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Create a password"
              prefix-icon="Lock"
              show-password
              aria-label="Password input"
            />
            <div class="password-requirements">
              Password must be at least 6 characters
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              prefix-icon="Lock"
              show-password
              aria-label="Confirm password input"
            />
          </el-form-item>

          <el-form-item class="terms-checkbox">
            <el-checkbox 
              v-model="acceptTerms" 
              @change="validateTerms"
              size="large"
            >
              I agree to the <el-link type="primary" @click.prevent="showTerms">Terms of Service</el-link> and <el-link type="primary" @click.prevent="showPrivacy">Privacy Policy</el-link>
            </el-checkbox>
          </el-form-item>

          <div class="form-actions">
            <el-button 
              type="primary" 
              native-type="submit" 
              :loading="loading" 
              class="submit-btn"
              :class="{ 'is-disabled': !acceptTerms }"
              @click="handleRegister"
              aria-label="Create account button"
            >
              <span class="btn-text">{{ loading ? 'Creating account...' : 'Create account' }}</span>
            </el-button>
          </div>
        </el-form>

        <div class="social-divider">
          <span>Or continue with</span>
        </div>

        <div class="social-buttons">
          <el-button class="social-btn google-btn" :loading="googleLoading">
            <img src="@/assets/google-icon.svg" alt="Google" class="social-icon" />
            Continue with Google
          </el-button>
          <el-button class="social-btn facebook-btn" :loading="facebookLoading">
            <img src="@/assets/facebook-icon.svg" alt="Facebook" class="social-icon" />
            Continue with Facebook
          </el-button>
        </div>

        <div class="form-footer">
          <span>Already have an account?</span>
          <router-link to="/login" class="auth-link">Sign in</router-link>
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
const acceptTerms = ref(false);

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const showTerms = () => {
  ElMessage({
    message: 'Terms of Service will open in a new tab',
    type: 'info'
  });
  // Implement opening terms in new tab
};

const showPrivacy = () => {
  ElMessage({
    message: 'Privacy Policy will open in a new tab',
    type: 'info'
  });
  // Implement opening privacy policy in new tab
};

const validateTerms = (value: boolean) => {
  acceptTerms.value = value;
  if (!value) {
    ElMessage({
      message: 'Please accept the Terms of Service and Privacy Policy to continue',
      type: 'warning'
    });
  }
};

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please enter password'));
  } else {
    if (form.value.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword', () => {});
      }
    }
    callback();
  }
};

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please confirm password'));
  } else if (value !== form.value.password) {
    callback(new Error("Passwords don't match!"));
  } else {
    callback();
  }
};

const rules = ref<FormRules>({
  username: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
});

const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const authStore = useAuthStore();
        await authStore.register(form.value.username, form.value.password);
        ElMessage.success('Registration successful!');
        router.push("/login");
      } catch (error: any) {
        ElMessage.error(error.message || "Registration failed");
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

.title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--topcv-primary);
  text-align: center;
}

.description {
  margin: 0 0 36px 0;
  color: #6B7280;
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.1px;
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
  padding: 4px 16px !important;
  background-color: #ffffff !important;
  border: 1.5px solid #d1d5db !important;
  box-shadow: none !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #9ca3af !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--topcv-primary) !important;
  box-shadow: 0 0 0 2px rgba(0, 177, 79, 0.08) !important;
}

:deep(.el-input__inner) {
  height: 42px !important;
  font-size: 15px !important;
  color: #374151 !important;
  font-weight: 450 !important;
}

:deep(.el-input__prefix) {
  color: #6B7280 !important;
}

.form-actions {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  height: 48px !important;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background-color: var(--topcv-primary);
  border-color: var(--topcv-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.submit-btn:hover:not(.is-disabled) {
  background-color: var(--topcv-primary-hover);
  border-color: var(--topcv-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.submit-btn.is-disabled {
  background-color: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  color: #6B7280 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

.btn-text {
  display: inline-block;
  pointer-events: none;
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

.field-hint {
  font-size: 13px;
  color: #6B7280;
  margin-top: 6px;
  margin-left: 2px;
}

.password-requirements {
  font-size: 13px;
  color: #6B7280;
  margin-top: 6px;
  margin-left: 2px;
  margin-bottom: 20px;
}

.terms-checkbox {
  margin-top: 16px;
  margin-bottom: 28px;
  padding-left: 16px;
}

:deep(.terms-checkbox .el-checkbox__label) {
  font-size: 14px;
  color: var(--topcv-text-secondary);
  line-height: 1.5;
  padding-left: 12px;
  max-width: calc(100% - 24px);
}

:deep(.terms-checkbox .el-link) {
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

:deep(.terms-checkbox .el-link:hover) {
  text-decoration: underline;
}

.social-buttons {
  display: flex;
  gap: 16px;
  margin: 32px 0;
}

.social-btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: var(--topcv-text-primary);
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0 16px;
}

.social-btn:hover {
  background: var(--topcv-background);
  border-color: var(--topcv-text-secondary);
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* Mobile Responsiveness */
@media (max-width: 480px) {
  .auth-card {
    padding: 24px;
    margin: 16px;
  }

  .social-buttons {
    flex-direction: column;
  }

  .social-btn {
    width: 100%;
  }

  .terms-checkbox {
    margin: 12px 0 20px;
  }
}

@media (max-width: 1024px) {
  .auth-banner {
    display: none;
  }
}
</style>
