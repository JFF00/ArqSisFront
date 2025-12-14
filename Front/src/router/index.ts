import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import ObservacionSalas from '@/views/ObservacionSalas.vue'
import Administrar from '@/views/Administrar.vue'
import Reservas from '@/views/Reservas.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'
import Notificaciones from '@/views/Notificaciones.vue'
import Salas from '@/views/Salas.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'home', component: Reservas },
        { path: '/notificaciones', name: 'notificaciones', component: Notificaciones },
        { path: '/salas', name: 'detalleSalas', component: ObservacionSalas },
        { path: '/admin', name: 'administrarSalas', component: Administrar },
        { path: '/adminsala', name: 'crearSalas', component: Salas },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Esperar a que se inicialice la autenticación si es la primera carga
  if (authStore.loading) {
    await authStore.initAuth()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
