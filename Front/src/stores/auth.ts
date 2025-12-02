import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth } from '@/firebase/config';
import { apolloClient } from '@/apollo';
import gql from 'graphql-tag';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const userRole = ref<string | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => userRole.value?.toUpperCase() === 'ADMIN');

  // Inicializar el estado de autenticación
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, async (currentUser) => {
        user.value = currentUser;
        if (currentUser) {
          token.value = await currentUser.getIdToken();
          // Intentar recuperar el rol si ya estamos logueados
          validateUserWithBackend().catch(() => {
            // Si falla la validación silenciosa al recargar, tal vez queramos hacer logout o no
            console.warn('No se pudo revalidar el usuario con el backend al iniciar');
          });
        } else {
          token.value = null;
          userRole.value = null;
        }
        loading.value = false;
        resolve();
      });
    });
  };

  const validateUserWithBackend = async () => {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query Me {
            me {
              uid
              email
              rol
              nombreCompleto
            }
          }
        `,
        fetchPolicy: 'network-only'
      });
      
      if (!data.me) {
        throw new Error('Usuario no autorizado en el sistema');
      }
      
      userRole.value = data.me.rol;
      return data.me;
    } catch (error: any) {
      console.error('Error validando usuario en backend:', error);
      userRole.value = null;
      // Si el error viene de GraphQL (ej: Unauthorized), lanzamos un error legible
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        throw new Error(error.graphQLErrors[0].message);
      }
      throw error;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      user.value = userCredential.user;
      token.value = await userCredential.user.getIdToken();
      
      try {
        await validateUserWithBackend();
      } catch (backendError) {
        // Si falla la validación del backend, hacemos logout de Firebase
        await logout();
        throw backendError;
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      user.value = userCredential.user;
      token.value = await userCredential.user.getIdToken();
      
      try {
        await validateUserWithBackend();
      } catch (backendError) {
        // Si falla la validación del backend, hacemos logout de Firebase
        await logout();
        throw backendError;
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
      token.value = null;
      userRole.value = null;
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const getToken = async () => {
    if (user.value) {
      // Forzar refresco si es necesario
      token.value = await user.value.getIdToken();
      return token.value;
    }
    return null;
  };

  return {
    user,
    userRole,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    initAuth,
    login,
    loginWithGoogle,
    logout,
    getToken
  };
});
