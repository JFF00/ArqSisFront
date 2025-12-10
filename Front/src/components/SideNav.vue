<template>
    <div>
        <header class="sidebar">
            <RouterLink to="/" class="link">Reservas</RouterLink>
            <RouterLink to="/salas" class="link">Detalle salas </RouterLink>
            <RouterLink to="/notificaciones" class="link">Notificaciones</RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="link">Administrar</RouterLink>
            <button @click="handleLogout" class="link logout-btn">Cerrar Sesión</button>
        </header>        
    </div>
   
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>


<style>
.sidebar {
  position: fixed;
  top: 80px; 
  left: 0;
  right: 0;
  height: 50px;
  background-color: #e3e3e3;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
  border-bottom: 1px solid #ccc;
  z-index: 9;
  width: 100%;
}
.link{
    display: flex;
    font-family:"Outfit", sans-serif;
    color: rgba(41, 40, 40, 0.801);
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    font-size: larger;
    text-decoration: none;
    border: none;
    background: none;
    cursor: pointer;
}

.logout-btn {
    margin-left: auto;
    color: #d32f2f;
}

.logout-btn:hover {
    background-color: rgba(211, 47, 47, 0.1);
}

</style>