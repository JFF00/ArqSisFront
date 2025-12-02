<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img src="@/assets/pace.png" alt="Logo PACE" class="logo" />
        <h2>Salas PACE UCN</h2>
      </div>
      
      <h3>Bienvenido</h3>
      <p class="subtitle">Inicia sesión para continuar</p>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button 
        @click="handleGoogleLogin" 
        :disabled="loading" 
        class="google-btn"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
        <span>{{ loading ? 'Conectando...' : 'Iniciar sesión con Google' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const error = ref('');
const loading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const handleGoogleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await authStore.loginWithGoogle();
    router.push('/'); // Redirigir al home después del login
  } catch (e: any) {
    error.value = 'Error al iniciar sesión: ' + (e.message || 'Inténtalo de nuevo');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  width: 100%;
}

.login-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  transition: transform 0.2s;
}

.login-card:hover {
  transform: translateY(-2px);
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  height: 60px;
  width: auto;
}

h2 {
  color: #1a73e8;
  margin: 0;
  font-size: 1.8rem;
}

h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s, box-shadow 0.2s;
  gap: 12px;
}

.google-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.3);
  border-color: #d2e3fc;
}

.google-btn:disabled {
  background-color: #f1f3f4;
  color: #bdc1c6;
  cursor: not-allowed;
}

.google-btn img {
  width: 18px;
  height: 18px;
}

.error-message {
  background-color: #fce8e6;
  color: #d93025;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid #fad2cf;
}
</style>
