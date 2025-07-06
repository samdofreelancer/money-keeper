import { createRouter, createWebHistory } from 'vue-router'
import CategoryView from '../views/CategoryView.vue'
import AccountView from '../views/AccountView.vue'
import ChatView from '../views/ChatView.vue'

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
      path: '/chat',
      name: 'chat',
      component: ChatView
    }
  ]
})

export default router
