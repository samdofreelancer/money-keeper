<template>
  <div class="app-container">
    <aside class="app-sidebar">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="Money Keeper" height="32">
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="accounts">
          <el-icon><Wallet /></el-icon>
          <span>Accounts</span>
        </el-menu-item>
        <el-menu-item index="transactions">
          <el-icon><Money /></el-icon>
          <span>Transactions</span>
        </el-menu-item>
        <el-menu-item index="categories">
          <el-icon><Grid /></el-icon>
          <span>Categories</span>
        </el-menu-item>
        <el-menu-item index="reports">
          <el-icon><TrendCharts /></el-icon>
          <span>Reports</span>
        </el-menu-item>
        <el-menu-item index="chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>Chat</span>
        </el-menu-item>
      </el-menu>
    </aside>
    
    <header class="app-header">
      <div class="header-content">
        <el-breadcrumb>
          <el-breadcrumb-item>Home</el-breadcrumb-item>
          <el-breadcrumb-item>{{ activeMenuLabel }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <el-dropdown>
            <el-avatar size="small">U</el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Profile</el-dropdown-item>
                <el-dropdown-item>Settings</el-dropdown-item>
                <el-dropdown-item divided>Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
      
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Grid, Money, TrendCharts } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = ref('categories')
const activeMenuLabel = ref('Categories')

function updateActiveMenu() {
  const path = route.path
  if (path.startsWith('/accounts')) {
    activeMenu.value = 'accounts'
    activeMenuLabel.value = 'Accounts'
  } else if (path.startsWith('/transactions')) {
    activeMenu.value = 'transactions'
    activeMenuLabel.value = 'Transactions'
  } else if (path.startsWith('/reports')) {
    activeMenu.value = 'reports'
    activeMenuLabel.value = 'Reports'
  } else if (path.startsWith('/chat')) {
    activeMenu.value = 'chat'
    activeMenuLabel.value = 'Chat'
  } else {
    activeMenu.value = 'categories'
    activeMenuLabel.value = 'Categories'
  }
}

watch(() => route.path, () => {
  updateActiveMenu()
}, { immediate: true })
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b2f3a;
}

.header-content {
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.el-menu-vertical {
  border-right: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 16px;
}
</style>
