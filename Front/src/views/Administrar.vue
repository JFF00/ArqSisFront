<template>
  <div class="solicitudes-container">
    <!-- DEBUG: Token Display -->
    <div v-if="authStore.token" class="token-debug-box">
      <h3>🔑 Token de Acceso (Debug)</h3>
      <p class="token-info">Usa este token en el header 'Authorization: Bearer ...' para probar la API</p>
      <div class="token-controls">
        <textarea readonly :value="authStore.token" rows="2" class="token-area"></textarea>
        <button @click="copyToken" class="btn-copy">Copiar</button>
      </div>
    </div>

    <h1 class="title">Solicitudes y Reservas</h1>

    <div v-if="loading" class="loading">Cargando reservas...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <div v-else class="table-wrapper">
      <table class="tabla-solicitudes">
        <thead>
          <tr>
            <!-- <th>ID</th> -->
            <th>Sala (ID)</th>
            <th>Motivo</th>
            <th>Usuario</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="reserva in reservas" :key="reserva.id">
            <!-- <td>{{ reserva.id }}</td> -->
            <td>{{ reserva.room_id }}</td>
            <td>{{ reserva.purpose }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ reserva.user?.nombreCompleto || 'Cargando...' }}</span>
                <span class="user-email">{{ reserva.user?.email || formatUid(reserva.user_uid) }}</span>
              </div>
            </td>
            <td>{{ formatDate(reserva.start_time) }}</td>
            <td>{{ formatDate(reserva.end_time) }}</td>
            <td>
              <span :class="['status-badge', reserva.status]">{{ reserva.status }}</span>
            </td>
            <td class="acciones">
              <button v-if="reserva.status === 'pending'" class="btn aceptar" @click="aceptar(reserva.id)">Aceptar</button>
              <button v-if="reserva.status === 'pending'" class="btn rechazar" @click="rechazar(reserva.id)">Rechazar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { LIST_RESERVATIONS } from '@/graphql/reservas/queryReservas'
import { APPROVE_RESERVATION, REJECT_RESERVATION } from '@/graphql/reservas/mutationReservas'

const authStore = useAuthStore()

const { result, loading, error, refetch } = useQuery(LIST_RESERVATIONS, null, {
  pollInterval: 1000 // Actualizar cada 1 segundo para mayor reactividad
})

const { mutate: approveReservation } = useMutation(APPROVE_RESERVATION)
const { mutate: rejectReservation } = useMutation(REJECT_RESERVATION)

const reservas = computed(() => result.value?.listReservations?.reservations || [])

const copyToken = () => {
  if (authStore.token) {
    navigator.clipboard.writeText(authStore.token)
    alert('Token copiado al portapapeles')
  }
}

function formatDate(isoString: string) {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleString()
}

function formatUid(uid: string) {
  return uid.substring(0, 8) + '...'
}

async function aceptar(id: number) {
  try {
    await approveReservation({ id })
    alert('Reserva aprobada correctamente')
    refetch()
  } catch (e) {
    console.error(e)
    alert('Error al aprobar reserva')
  }
}

async function rechazar(id: number) {
  const reason = prompt('Ingrese el motivo del rechazo:')
  if (!reason) return

  try {
    await rejectReservation({ id, reason })
    alert('Reserva rechazada correctamente')
    refetch()
  } catch (e) {
    console.error(e)
    alert('Error al rechazar reserva')
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
.status-badge.pending { background-color: #fff3cd; color: #856404; }
.status-badge.confirmed { background-color: #d4edda; color: #155724; }
.status-badge.rejected { background-color: #f8d7da; color: #721c24; }
.status-badge.processing { background-color: #cce5ff; color: #004085; }

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

.acciones {
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
</style>
