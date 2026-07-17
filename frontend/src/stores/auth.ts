import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type AuthResponse, type RegisterRequest } from '@/api/auth'
import router from '@/router'
import axios from 'axios'
import { apiBaseUrl } from '@/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthResponse | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.roles?.includes('ROLE_ADMIN') ?? false)
  const userEmail = computed(() => user.value?.email ?? '')
  const userName = computed(() => user.value?.fullName ?? '')

  // Configure axios default to always attach token
  function setupAxiosInterceptor() {
    axios.interceptors.request.use(
      (config) => {
        if (token.value) {
          config.headers.Authorization = `Bearer ${token.value}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout()
        }
        return Promise.reject(error)
      }
    )
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await authApi.login({ email, password })
      token.value = response.token
      user.value = response
      localStorage.setItem('token', response.token)
      setupAxiosInterceptor()
      await router.push('/accounts')
    } catch (error: any) {
      localStorage.removeItem('token')
      token.value = null
      user.value = null
      throw new Error(error.response?.data?.message || 'Login failed')
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true
    try {
      const response = await authApi.register(data)
      token.value = response.token
      user.value = response
      localStorage.setItem('token', response.token)
      setupAxiosInterceptor()
      await router.push('/accounts')
    } catch (error: any) {
      localStorage.removeItem('token')
      token.value = null
      user.value = null
      throw new Error(error.response?.data?.message || 'Registration failed')
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    try {
      setupAxiosInterceptor()
      const response = await authApi.me()
      user.value = {
        token: token.value,
        email: response.email,
        fullName: response.fullName,
        roles: response.roles
      }
    } catch {
      logout()
    }
  }

  // Initialize interceptor on store creation
  if (token.value) {
    setupAxiosInterceptor()
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    userEmail,
    userName,
    login,
    register,
    logout,
    fetchCurrentUser
  }
})