import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/accounts'
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/CategoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('../views/AccountView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tax-calculator',
      name: 'tax-calculator',
      component: () => import('../views/TaxCalculatorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tax-settings',
      name: 'tax-settings',
      component: () => import('../views/TaxSettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard — redirect unauthenticated users to login
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Skip auth check for public routes (login/register)
  if (to.meta.requiresAuth === false) {
    // If already logged in, redirect away from login page
    if (authStore.isAuthenticated && to.name === 'login') {
      return next('/accounts')
    }
    return next()
  }

  // Protected routes — require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  next()
})

export default router
