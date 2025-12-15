<template>
  <div class="contenedorPrincipal">
    <h1 class="title">Mis Reservas</h1>

    <div v-if="loading" class="loading">Cargando reservas...</div>
    <div v-else-if="error" class="error">Error al cargar reservas: {{ error.message }}</div>

    <p v-else-if="notificaciones.length === 0" class="sinNotificaciones">
      No tienes reservas registradas.
    </p>

    <div v-else class="listaNotificaciones">
      <div
        v-for="(item, index) in notificaciones"
        :key="index"
        class="notificacion"
        :class="getClassForStatus(item.status)"
      >
        <!-- FECHA A LA IZQUIERDA -->
        <span class="fechaNotificacion">
          Creada: {{ formatearFecha(item.created_at) }}
        </span>

        <h3 class="notificacionTitulo">Reserva Sala {{ item.room_id }}</h3>

        <p class="notificacionDescripcion">
          <strong>Propósito:</strong> {{ item.purpose }}<br/>
          <strong>Horario:</strong> {{ formatearFechaHora(item.start_time) }} - {{ formatearFechaHora(item.end_time) }}
        </p>

        <span class="estado">
          Estado: {{ traducirEstado(item.status) }}
        </span>

        <p v-if="item.status === 'rejected' && item.rejection_reason" class="motivo-rechazo">
          <strong>Motivo:</strong> {{ item.rejection_reason }}
        </p>

        <button 
          v-if="item.status === 'pending'" 
          class="btn-cancelar"
          @click="cancelar(item.id)"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { GET_MY_RESERVATIONS } from '@/graphql/reservas/queryReservas'
import { CANCEL_RESERVATION } from '@/graphql/reservas/mutationReservas'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

// Habilitar la query solo si tenemos usuario
const enabled = computed(() => !!authStore.user?.uid)

const { result, loading, error, refetch } = useQuery(
  GET_MY_RESERVATIONS,
  () => ({
    input: {
      user_uid: authStore.user?.uid
    }
  }),
  {
    enabled,
    pollInterval: 2000 // Actualizar cada 2 segundos para ver cambios de estado
  }
)

const { mutate: cancelReservationMutation } = useMutation(CANCEL_RESERVATION)

async function cancelar(id: number) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Deseas cancelar esta reserva?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  })

  if (!result.isConfirmed) return

  try {
    await cancelReservationMutation({ id })
    Swal.fire(
      'Cancelada!',
      'La reserva ha sido cancelada.',
      'success'
    )
    refetch()
  } catch (e) {
    console.error(e)
    Swal.fire(
      'Error!',
      'Hubo un problema al cancelar la reserva.',
      'error'
    )
  }
}

// Mapear los resultados a la estructura que usamos en el template
const notificaciones = computed(() => {
  const reservas = result.value?.listReservations?.reservations || []
  // Ordenar por fecha de creación descendente (más recientes primero)
  return [...reservas].sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

// Recargar cuando cambia el usuario
watch(() => authStore.user?.uid, (newUid) => {
  if (newUid) {
    refetch()
  }
})

/* Función para mostrar la fecha en formato bonito */
const formatearFecha = (fecha: string) => {
  if (!fecha) return ''
  const f = new Date(fecha)
  return f.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatearFechaHora = (fecha: string) => {
  if (!fecha) return ''
  // Eliminar la 'Z' para que el navegador lo interprete como hora local (Wall Clock Time)
  // y no realice conversión de zona horaria (UTC -> Local)
  const fechaLocal = fecha.replace('Z', '')
  const f = new Date(fechaLocal)
  
  return f.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getClassForStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'aprobada'
    case 'rejected': return 'rechazada'
    case 'pending': return 'pendiente'
    default: return ''
  }
}

const traducirEstado = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'Aprobada'
    case 'rejected': return 'Rechazada'
    case 'pending': return 'Pendiente'
    case 'processing': return 'Procesando'
    default: return status
  }
}
</script>

<style>
.contenedorPrincipal {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.title {
  margin-bottom: 1rem;
  text-align: center;
}

.sinNotificaciones {
  font-size: 1rem;
  color: #555;
}

.loading, .error {
  margin: 1rem;
  font-weight: bold;
}

.error {
  color: red;
}

/* Lista */
.listaNotificaciones {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tarjetas */
.notificacion {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
}

/* FECHA ESTILO */
.fechaNotificacion {
  font-size: 0.8rem;
  color: #888; /* gris suave */
  margin-bottom: 0.3rem;
}

/* Títulos */
.notificacionTitulo {
  margin: 0 0 0.4rem 0;
  font-size: 1.1rem;
}

/* Texto */
.notificacionDescripcion {
  margin: 0 0 0.5rem 0;
  color: #555;
}

/* Estado */
.estado {
  font-weight: bold;
  margin-top: 0.5rem;
}

.motivo-rechazo {
  margin-top: 0.5rem;
  color: #d32f2f;
  font-style: italic;
  background-color: #ffebee;
  padding: 5px;
  border-radius: 4px;
}

.aprobada {
  border-left: 6px solid #4caf50;
}

.rechazada {
  border-left: 6px solid #e53935;
}

.pendiente {
  border-left: 6px solid #ff9800;
}

.btn-cancelar {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
}

.btn-cancelar:hover {
  background-color: #d32f2f;
}
</style>
