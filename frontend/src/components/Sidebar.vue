<template>
  <div class="sidebar">
    <ul>
      <li>
        <router-link to="/categories" :class="{ 'active-link': isActive('/categories') }">Categories</router-link>
      </li>
      <li>
        <router-link to="/transactions" :class="{ 'active-link': isActive('/transactions') }">Transactions</router-link>
      </li>
      <li>
        <router-link to="/reports" :class="{ 'active-link': isActive('/reports') }">Reports</router-link>
      </li>
      <li>
        <router-link to="/accounts" :class="{ 'active-link': isActive('/accounts') }">Accounts</router-link>
      </li>
      <li>
        <router-link to="/settings" :class="{ 'active-link': isActive('/settings') }">Settings</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
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
