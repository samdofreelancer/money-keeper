<template>
  <div class="page-container">
    <div class="auth-card">
      <h2 class="title">Login</h2>
      <p class="description">Welcome back! Please login to your account</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="Email" prop="username">
          <el-input
            v-model="form.username"
            type="email"
            placeholder="Enter your email"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">
            Login
          </el-button>
        </div>

        <div class="form-footer">
          Don't have an account?
          <router-link to="/register">Register</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/api/auth";
import { ElMessage } from 'element-plus';
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
        const response = await login(form.value.username, form.value.password);
        ElMessage.success('Login successful!');
        // Store token in a secure way
        localStorage.setItem('token', response.token);
        router.push("/");
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
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
  text-align: center;
}

.description {
  margin: 8px 0 24px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.form-actions {
  margin-top: 24px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.form-footer {
  margin-top: 16px;
  text-align: center;
  color: var(--el-text-color-secondary);
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
