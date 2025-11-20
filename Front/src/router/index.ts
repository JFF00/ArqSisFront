import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import ObservacionSalas from '@/views/ObservacionSalas.vue'
import Administrar from '@/views/Administrar.vue'
import Reservas from '@/views/Reservas.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'home', component: Reservas },
        { path: '/salas', name: 'detalleSalas', component: ObservacionSalas },
        { path: '/admin', name: 'administrarSalas', component: Administrar },
      ],
    },
  ],
})

export default router
