import { createRouter, createWebHistory } from 'vue-router'
import CategoryView from '../views/CategoryView.vue'
import AccountView from '../views/AccountView.vue'
import SettingsView from '../views/SettingsView.vue'
import TaxCalculatorView from '../views/TaxCalculatorView.vue'
import TaxSettingsView from '../views/TaxSettingsView.vue'

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
      path: '/tax-calculator',
      name: 'tax-calculator',
      component: TaxCalculatorView
    },
    {
      path: '/tax-settings',
      name: 'tax-settings',
      component: TaxSettingsView
    }
  ]
})

export default router
