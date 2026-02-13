import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import GoView from '../views/GoView.vue'
import AuthView from '../views/AuthView.vue'
import { isAuthenticated } from '../services/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/go/:code', name: 'go', component: GoView },
    { path: '/auth', name: 'auth', component: AuthView },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'admin' && !isAuthenticated()) {
    return { name: 'auth' }
  }
  return true
})

export default router
