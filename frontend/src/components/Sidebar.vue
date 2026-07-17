<template>
  <div class="sidebar">
    <div class="user-section" v-if="authStore.isAuthenticated">
      <div class="user-info">
        <div class="user-avatar">{{ authStore.userName.charAt(0).toUpperCase() }}</div>
        <div class="user-details">
          <div class="user-name">{{ authStore.userName }}</div>
          <div class="user-email">{{ authStore.userEmail }}</div>
        </div>
      </div>
      <el-button type="danger" size="small" @click="handleLogout" plain>Logout</el-button>
    </div>

    <ul>
      <li>
        <router-link to="/categories" :class="{ 'active-link': isActive('/categories') }">Categories</router-link>
      </li>
      <li>
        <router-link to="/accounts" :class="{ 'active-link': isActive('/accounts') }">Accounts</router-link>
      </li>
      <li>
        <router-link to="/tax-calculator" :class="{ 'active-link': isActive('/tax-calculator') }">💰 Tax Calculator</router-link>
      </li>
      <li>
        <router-link to="/tax-settings" :class="{ 'active-link': isActive('/tax-settings') }">⚙️ Tax Settings</router-link>
      </li>
      <li>
        <router-link to="/settings" :class="{ 'active-link': isActive('/settings') }">Settings</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #2d3a4b;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 16px;
}

a {
  color: #b0bec5;
  text-decoration: none;
  font-weight: 500;
}

a.active-link {
  color: #42b983;
  font-weight: 700;
}
</style>
