import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CategoryView from '../views/CategoryView.vue'
import AccountView from '../views/AccountView.vue'
import SettingsView from '../views/SettingsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/categories'
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountView,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true }
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Initialize authStore
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.includes(to.path)
  
  if (!isPublicPath && !isAuthenticated) {
    // Store the intended destination and redirect to login
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } 
  // If authenticated user tries to access login/register pages
  else if (isPublicPath && isAuthenticated) {
    next({ path: '/' })
  }
  // Allow navigation
  else {
    next()
  }
})

export default router
