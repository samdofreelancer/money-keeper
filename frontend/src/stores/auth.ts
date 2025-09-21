import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage on store creation
  const initialize = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
    }
  }
  const token = ref(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value)
  
  async function login(username: string, password: string) {
    try {
      const response = await axios.post('/auth/login', { username, password })
      token.value = response.data.token
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      token.value = null
      localStorage.removeItem('token')
      throw error
    }
  }

  async function register(username: string, password: string) {
    try {
      const response = await axios.post('/auth/register', { username, password })
      return response.data
    } catch (error) {
      throw error
    }
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  // Initialize the store
  initialize()

  return {
    token,
    isAuthenticated,
    login,
    register,
    logout
  }
})
