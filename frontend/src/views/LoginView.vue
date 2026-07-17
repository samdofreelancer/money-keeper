<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <div class="logo">💰</div>
          <h2>Money Keeper</h2>
          <p class="subtitle">Sign in to your account</p>
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
        @submit.prevent="handleLogin"
        label-position="top"
        size="large"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
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
            {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-link">
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    errorMessage.value = ''
    await authStore.login(form.email, form.password)
  } catch (error: any) {
    errorMessage.value = error.message || 'Invalid email or password'
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
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

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 16px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>