import { createRouter, createWebHistory } from 'vue-router'
import Calendario from '@/views/Calendario.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import ObservacionSalas from '@/views/ObservacionSalas.vue'
import Administrar from '@/views/Administrar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children:[
        {path:'',name:'home',component:Calendario},
        {path:'/salas',name:"detalleSalas",component:ObservacionSalas},
        {path:'/admin',name:"administrarSalas",component:Administrar}

      ]
    }
    
  ]
})

export default router
