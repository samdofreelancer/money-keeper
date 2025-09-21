import { createRouter, createWebHistory } from 'vue-router'
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
      component: CategoryView
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    }
  ]
})

export default router
