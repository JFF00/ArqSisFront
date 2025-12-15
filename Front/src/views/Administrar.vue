<template>
  <div class="solicitudes-container">
    

    <h1 class="title">Solicitudes y Reservas</h1>

    <div class="filtros-container">
      <div class="filtro-grupo">
        <label>Filtrar por Fecha:</label>
        <input type="date" v-model="filtroFecha" class="filtro-input" />
      </div>
      
      <div class="filtro-grupo">
        <label>Filtrar por Estado:</label>
        <select v-model="filtroEstado" class="filtro-input">
          <option value="">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando reservas...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <div v-else class="table-wrapper">
      <table class="tabla-solicitudes">
        <thead>
          <tr>
            <!-- <th>ID</th> -->
            <!-- <th>Sala (ID)</th> -->
            <th>Motivo</th>
            <th>Usuario</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="reserva in reservasFiltradas" :key="reserva.id">
            <!-- <td>{{ reserva.id }}</td> -->
            <!-- <td>{{ reserva.room_id }}</td> -->
            <td>{{ reserva.purpose }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ reserva.user?.nombreCompleto || 'Cargando...' }}</span>
                <span class="user-email">{{
                  reserva.user?.email || formatUid(reserva.user_uid)
                }}</span>
              </div>
            </td>
            <td>{{ formatDate(reserva.start_time) }}</td>
            <td>{{ formatDate(reserva.end_time) }}</td>
            <td>
              <span :class="['status-badge', reserva.status]">{{ reserva.status }}</span>
            </td>
            <td>
              <div class="acciones-container">
                <button
                  v-if="reserva.status === 'pending'"
                  class="btn aceptar"
                  @click="aceptar(reserva.id)"
                >
                  Aceptar
                </button>
                <button
                  v-if="reserva.status === 'pending'"
                  class="btn rechazar"
                  @click="rechazar(reserva.id)"
                >
                  Rechazar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { LIST_RESERVATIONS } from '@/graphql/reservas/queryReservas'
import { APPROVE_RESERVATION, REJECT_RESERVATION } from '@/graphql/reservas/mutationReservas'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

const { result, loading, error, refetch } = useQuery(LIST_RESERVATIONS, null, {
  pollInterval: 1000, // Actualizar cada 1 segundo para mayor reactividad
})

const { mutate: approveReservation } = useMutation(APPROVE_RESERVATION)
const { mutate: rejectReservation } = useMutation(REJECT_RESERVATION)

const reservas = computed(() => result.value?.listReservations?.reservations || [])

const filtroFecha = ref('')
const filtroEstado = ref('')

const reservasFiltradas = computed(() => {
  let filtered = reservas.value

  if (filtroFecha.value) {
    filtered = filtered.filter((r: any) => {
      if (!r.start_time) return false
      // Convertir start_time a fecha local YYYY-MM-DD para comparar
      const fechaReserva = r.start_time.replace('Z', '').split('T')[0]
      return fechaReserva === filtroFecha.value
    })
  }

  if (filtroEstado.value) {
    filtered = filtered.filter((r: any) => r.status === filtroEstado.value)
  }

  return filtered
})

const copyToken = () => {
  if (authStore.token) {
    navigator.clipboard.writeText(authStore.token)
    Swal.fire({
      icon: 'success',
      title: 'Token copiado',
      text: 'Token copiado al portapapeles',
      timer: 1500,
      showConfirmButton: false
    })
  }
}

function formatDate(isoString: string) {
  if (!isoString) return '-'
  // Eliminar la 'Z' para que se interprete como hora local
  const localIso = isoString.replace('Z', '')
  return new Date(localIso).toLocaleString()
}

function formatUid(uid: string) {
  return uid.substring(0, 8) + '...'
}

async function aceptar(id: number) {
  try {
    await approveReservation({ id })
    Swal.fire({
      icon: 'success',
      title: 'Aprobada',
      text: 'Reserva aprobada correctamente',
      timer: 1500,
      showConfirmButton: false
    })
    refetch()
  } catch (e) {
    console.error(e)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al aprobar reserva'
    })
  }
}

async function rechazar(id: number) {
  const { value: reason } = await Swal.fire({
    title: 'Rechazar reserva',
    input: 'text',
    inputLabel: 'Ingrese el motivo del rechazo',
    inputPlaceholder: 'Motivo...',
    showCancelButton: true,
    confirmButtonText: 'Rechazar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return '¡Debes ingresar un motivo!'
      }
    }
  })

  if (!reason) return

  try {
    await rejectReservation({ id, reason })
    Swal.fire({
      icon: 'success',
      title: 'Rechazada',
      text: 'Reserva rechazada correctamente',
      timer: 1500,
      showConfirmButton: false
    })
    refetch()
  } catch (e) {
    console.error(e)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al rechazar reserva'
    })
  }
}
</script>

<style scoped>
.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: bold;
}
.user-email {
  font-size: 0.8em;
  color: #666;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
  text-transform: uppercase;
}
.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}
.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}
.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}
.status-badge.processing {
  background-color: #cce5ff;
  color: #004085;
}

.token-debug-box {
  background-color: #f8f9fa;
  border: 2px dashed #dc3545;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 8px;
}

.token-info {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.token-controls {
  display: flex;
  gap: 1rem;
}

.token-area {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  resize: none;
}

.btn-copy {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-copy:hover {
  background-color: #218838;
}

.solicitudes-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-family: 'Cal Sans', sans-serif;
  font-size: 2rem;
  font-weight: bold;
  text-align: left;
}

/* Permite scroll SOLO en la tabla */
.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
}

.tabla-solicitudes {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border: 1px solid #ccc;
  font-family: 'Outfit', sans-serif;
}

th {
  background: #f4f4f4;
  font-weight: bold;
}

.acciones-container {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.aceptar {
  background-color: #4caf50;
}

.rechazar {
  background-color: #f44336;
}

.btn:hover {
  opacity: 0.8;
}

.filtros-container {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filtro-grupo label {
  font-weight: bold;
  font-size: 0.9em;
  color: #555;
}

.filtro-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Outfit', sans-serif;
}
</style>
