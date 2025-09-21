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
          <el-form-item prop="email" class="mb-4">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              prefix-icon="Message"
              aria-label="Email input"
              id="email-input"
              aria-describedby="email-helper-text email-error-message"
            />
            <p id="email-helper-text" class="text-gray-500 text-sm mt-1">We’ll send a verification link to this email</p>
          </el-form-item>

          <el-form-item prop="password" class="mb-4">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Create a password"
              prefix-icon="Lock"
              show-password
              aria-label="Password input"
              id="password-input"
              aria-describedby="password-helper-text password-error-message"
            />
            <p id="password-helper-text" class="text-gray-500 text-sm mt-1">Password must be at least 6 characters</p>
          </el-form-item>

          <el-form-item prop="confirmPassword" class="mb-4">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm your password"
              prefix-icon="Lock"
              show-password
              aria-label="Confirm password input"
              id="confirm-password-input"
              aria-describedby="confirm-password-error-message"
            />
          </el-form-item>

          <el-form-item class="terms-checkbox mb-4" :class="{ 'is-error': termsError }">
            <el-checkbox 
              v-model="acceptTerms" 
              size="large"
              id="terms-checkbox"
              aria-describedby="terms-error-message"
            >
              I agree to the <el-link type="primary" @click.prevent="showTerms">Terms of Service</el-link> and <el-link type="primary" @click.prevent="showPrivacy">Privacy Policy</el-link>
            </el-checkbox>
            <div v-if="termsError" id="terms-error-message" class="el-form-item__error" role="alert">{{ termsError }}</div>
          </el-form-item>

          <div class="form-actions">
            <el-button 
              type="primary" 
              native-type="submit" 
              :loading="loading" 
              class="create-account-btn"
              :disabled="!isFormValid"
              @click="handleRegister"
              aria-label="Create account button"
            >
              <span class="btn-text">{{ loading ? 'Creating account...' : 'Create account' }}</span>
            </el-button>
          </div>
        </el-form>

        <div class="social-divider mt-5 mb-5">
          <span>Or continue with</span>
        </div>

        <div class="social-buttons flex flex-col md:flex-row gap-3 mb-6">
          <el-button class="social-btn google-btn" :loading="googleLoading">
            <img src="@/assets/google-icon.svg" alt="Google" class="social-icon pl-2" />
            <span class="ml-2">Continue with Google</span>
          </el-button>
          <el-button class="social-btn facebook-btn" :loading="facebookLoading">
            <img src="@/assets/facebook-icon.svg" alt="Facebook" class="social-icon pl-2" />
            <span class="ml-2">Continue with Facebook</span>
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
import { ref, computed, nextTick } from "vue";
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
const termsError = ref(''); // New ref for terms error

const form = ref({
  email: '', // Renamed from username to email for clarity
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

const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('Please enter your email address.'));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { // Simple RFC-ish regex
    callback(new Error('Please enter a valid email address.'));
  } else {
    callback();
  }
};

const validatePassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Please create a password.'));
  } else if (value.length < 6) {
    callback(new Error('Password must be at least 6 characters.'));
  } else {
    if (form.value.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword', () => {});
      }
    }
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Please confirm your password.'));
  } else if (value !== form.value.password) {
    callback(new Error("Passwords don't match."));
  } else {
    callback();
  }
};

const rules = ref<FormRules>({
  email: [
    { required: true, validator: validateEmail, trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, validator: validatePassword, trigger: ['blur', 'change'] },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: ['blur', 'change'] }
  ]
});

const isFormValid = computed(() => {
  // Element Plus form validation state is not directly exposed as a single boolean.
  // We'll rely on manual checks for the button's disabled state.
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
  const passwordValid = form.value.password.length >= 6;
  const confirmPasswordValid = form.value.confirmPassword === form.value.password && form.value.confirmPassword !== '';
  
  return emailValid && passwordValid && confirmPasswordValid && acceptTerms.value;
});

const handleRegister = async () => {
  termsError.value = ''; // Clear previous terms error
  if (!formRef.value) return;

  const formValidated = await formRef.value.validate();
  
  if (!acceptTerms.value) {
    termsError.value = 'You must agree to the Terms to continue.';
    // Scroll to terms checkbox if not visible
    nextTick(() => {
      const termsElement = document.querySelector('.terms-checkbox');
      if (termsElement) {
        termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    return;
  }

  if (formValidated && acceptTerms.value) {
    try {
      loading.value = true;
      const authStore = useAuthStore();
      await authStore.register(form.value.email, form.value.password);
      ElMessage.success('Registration successful!');
      router.push("/login");
    } catch (error: any) {
      ElMessage.error(error.message || "Registration failed");
    } finally {
      loading.value = false;
    }
  }
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

:deep(.el-form-item) {
  margin-bottom: 16px; /* Default spacing */
}

:deep(.el-form-item__label) {
  font-weight: 500;
  padding-bottom: 8px;
  color: var(--el-text-color-primary);
}

:deep(.el-input__wrapper) {
  background-color: white !important;
  border: 1px solid #d1d5db !important;
  box-shadow: none !important;
  border-radius: 6px !important; /* rounded-md */
  padding: 0 12px !important; /* px-3 */
  height: 46px !important;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: transparent !important;
  box-shadow: 0 0 0 2px #34D399 !important; /* focus:ring-2 focus:ring-green-500 */
}

:deep(.el-input__wrapper.is-error) {
  border-color: #EF4444 !important; /* border-red-500 */
}

:deep(.el-input__inner) {
  height: 42px !important;
  font-size: 15px !important;
  color: #374151 !important;
  font-weight: 450 !important;
}

:deep(.el-input__prefix) {
  color: #6B7280 !important;
  margin-right: 8px; /* Adjust icon spacing */
}

.text-gray-500 {
  color: #6B7280;
}

.text-sm {
  font-size: 0.875rem; /* 14px */
}

.mt-1 {
  margin-top: 0.25rem; /* 4px */
}

.create-account-btn {
  height: 48px !important;
  width: 100%;
  border-radius: 6px; /* rounded-md */
  font-weight: 500; /* font-medium */
  transition: all 0.2s ease;
  background-color: #10B981; /* bg-green-500 */
  border-color: #10B981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.create-account-btn:hover:not(:disabled) {
  background-color: #059669; /* hover:bg-green-600 */
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.create-account-btn:disabled {
  background-color: #E5E7EB !important; /* bg-gray-200 */
  color: #9CA3AF !important; /* text-gray-500 */
  cursor: not-allowed !important;
  border-color: #E5E7EB !important;
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

.terms-checkbox {
  margin-top: 16px;
  margin-bottom: 16px; /* Adjusted for rhythm */
  padding-left: 0; /* Align with input left edge */
}

:deep(.terms-checkbox .el-checkbox__input) {
  margin-right: 8px; /* Adjust checkbox spacing */
}

:deep(.terms-checkbox .el-checkbox__label) {
  font-size: 14px;
  color: #6B7280; /* text-gray-500 */
  line-height: 1.5;
  padding-left: 0; /* Remove default padding */
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

.social-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9CA3AF; /* text-gray-400 */
  font-size: 14px;
  margin-top: 20px; /* Button -> divider: 16-20px */
  margin-bottom: 20px;
}

.social-divider::before, .social-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #E5E7EB; /* border-gray-300 */
}

.social-divider:not(:empty)::before {
  margin-right: .5em;
}

.social-divider:not(:empty)::after {
  margin-left: .5em;
}

.social-buttons {
  display: flex;
  gap: 12px; /* gap-3 */
  margin-bottom: 24px; /* Adjusted for rhythm */
}

.social-btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
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
@media (max-width: 768px) { /* Changed from 480px to 768px for md:flex-row breakpoint */
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
