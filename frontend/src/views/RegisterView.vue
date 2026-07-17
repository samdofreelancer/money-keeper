<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <div class="logo">💰</div>
          <h2>Create Account</h2>
          <p class="subtitle">Join Money Keeper to manage your finances</p>
        </div>
      </template>

      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        closable
        @close="errorMessage = ''"
        class="error-alert"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleRegister"
        label-position="top"
        size="large"
      >
        <el-form-item label="Full Name" prop="fullName">
          <el-input
            v-model="form.fullName"
            placeholder="John Doe"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="At least 6 characters"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="authStore.loading"
            class="submit-btn"
          >
            {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-link">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const errorMessage = ref('')

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  fullName: [
    { required: true, message: 'Full name is required', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleRegister() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    errorMessage.value = ''
    await authStore.register({
      email: form.email,
      password: form.password,
      fullName: form.fullName
    })
  } catch (error: any) {
    errorMessage.value = error.message || 'Registration failed. Please try again.'
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 420px;
  max-width: 90vw;
}

.card-header {
  text-align: center;
}

.logo {
  font-size: 48px;
  margin-bottom: 8px;
}

h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.error-alert {
  margin-bottom: 16px;
}

.submit-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 16px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>