<template>
  <div class="detalle-sala">
    <h2>{{ sala?.nombre }}</h2>
    <p><strong>Ubicación:</strong> {{ sala?.ubicacion }}</p>
    <p><strong>Capacidad:</strong> {{ sala?.capacidad }} personas</p>

    <!-- Selector de Fecha -->
    <div class="fecha-selector-container">
      <label for="fecha">Selecciona una fecha:</label>
      <input 
        type="date" 
        id="fecha" 
        v-model="fechaSeleccionada" 
        :min="minDate"
        class="input-fecha"
      />
    </div>

    <!-- Selección de Bloques -->
    <div v-if="fechaSeleccionada" class="bloques-container">
      <h3>Selecciona un bloque horario:</h3>
      <div class="grid-bloques">
        <div 
          v-for="(horario, bloque) in bloquesHorarios" 
          :key="bloque"
          class="bloque-item"
          :class="getEstadoBloque(bloque, horario)"
          @click="seleccionarBloque(bloque, horario)"
        >
          <div class="bloque-nombre">Bloque {{ bloque }}</div>
          <div class="bloque-hora">{{ horario.start }} - {{ horario.end }}</div>
          <div class="bloque-estado">{{ getTextoEstado(bloque, horario) }}</div>
        </div>
      </div>
    </div>
    <div v-else class="mensaje-ayuda">
      <p> Por favor selecciona una fecha para ver los bloques disponibles.</p>
    </div>

    <!-- Formulario de Reserva -->
    <div v-if="bloqueSeleccionado" class="formulario-reserva">
      <div class="seleccion-info">
        <p>Reserva para: <strong>{{ sala?.nombre }}</strong></p>
        <p>Fecha: <strong>{{ fechaFormateada }}</strong></p>
        <p>Bloque: <strong>{{ bloqueSeleccionado }}</strong> ({{ bloquesHorarios[bloqueSeleccionado].start }} - {{ bloquesHorarios[bloqueSeleccionado].end }})</p>
      </div>

      <div class="campo-motivo">
        <label>Motivo de la reserva:</label>
        <select v-model="motivoSeleccionado" class="motivo-select">
          <option disabled value="">Selecciona un motivo</option>
          <option value="Clase">Clase</option>
          <option value="Ayudantía">Ayudantía</option>
          <option value="Reunión">Reunión</option>
          <option value="Estudio">Estudio</option>
          <option value="Evento">Evento</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <button 
        class="btn-enviar" 
        :disabled="!motivoSeleccionado || loadingMutation"
        @click="enviarSolicitud"
      >
        {{ loadingMutation ? 'Enviando...' : 'Confirmar Reserva' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Sala } from '@/interfaces/salas'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { CREATE_RESERVATION } from '@/graphql/reservas/mutationReservas'
import { LIST_RESERVATIONS } from '@/graphql/reservas/queryReservas'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const props = defineProps<{ sala: Sala | null }>()
const authStore = useAuthStore()

// Tipos
type Bloque = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
const bloquesHorarios: Record<Bloque, { start: string; end: string }> = {
  A: { start: '08:10', end: '09:40' },
  B: { start: '09:55', end: '11:25' },
  C: { start: '11:40', end: '13:10' },
  D: { start: '14:30', end: '16:00' },
  E: { start: '16:15', end: '17:45' },
  F: { start: '18:00', end: '19:30' },
}

// Estado
const fechaSeleccionada = ref('')
const bloqueSeleccionado = ref<Bloque | null>(null)
const motivoSeleccionado = ref('')
const minDate = new Date().toISOString().split('T')[0]

// Query para obtener reservas de la sala
const { result, refetch } = useQuery(LIST_RESERVATIONS, () => ({
  input: {
    room_id: props.sala?.id ? Number(props.sala.id) : null
  }
}), {
  pollInterval: 5000 // Actualizar cada 5s
})

// Mutation
const { mutate: createReservation, loading: loadingMutation } = useMutation(CREATE_RESERVATION)

// Computed
const reservasExistentes = computed(() => result.value?.listReservations?.reservations || [])

const fechaFormateada = computed(() => {
  if (!fechaSeleccionada.value) return ''
  // Ajustar zona horaria para visualización correcta
  const [year, month, day] = fechaSeleccionada.value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

// Métodos de Estado
function getEstadoBloque(bloque: Bloque, horario: { start: string; end: string }) {
  if (!fechaSeleccionada.value) return ''
  
  // Parsear fecha como LOCAL (no UTC)
  const [year, month, day] = fechaSeleccionada.value.split('-').map(Number)
  const fechaSeleccionadaDate = new Date(year, month - 1, day) // Mes es 0-indexado

  // 1. Verificar si es pasado
  const ahora = new Date()
  const hoyDate = new Date()
  hoyDate.setHours(0,0,0,0) // Resetear hora de hoy a medianoche

  // Si la fecha es anterior a hoy
  if (fechaSeleccionadaDate < hoyDate) return 'pasado'

  // Si es hoy, verificar la hora del bloque
  if (fechaSeleccionadaDate.getTime() === hoyDate.getTime()) {
     const [horaFin, minFin] = horario.end.split(':').map(Number)
     const ahoraMins = ahora.getHours() * 60 + ahora.getMinutes()
     const finMins = horaFin * 60 + minFin
     
     // Si ya pasó la hora de término del bloque
     if (ahoraMins > finMins) return 'pasado'
  }

  // 2. Verificar si está ocupado
  const ocupado = reservasExistentes.value.some((res: any) => {
    if (!res || !res.start_time || !res.end_time) return false
    if (res.status === 'cancelled' || res.status === 'rejected') return false
    
    try {
      // Parsear fechas asegurando que se traten como locales (ignorando la Z si viene)
      // Esto es necesario porque guardamos la hora local "falsificada" como UTC en la BD
      const startStr = res.start_time.replace('Z', '')
      const endStr = res.end_time.replace('Z', '')
      
      const resStart = new Date(startStr)
      const resEnd = new Date(endStr)
      
      // Construir fechas del bloque en base a la fecha seleccionada LOCAL
      const [horaIni, minIni] = horario.start.split(':').map(Number)
      const bloqueStart = new Date(year, month - 1, day)
      bloqueStart.setHours(horaIni, minIni, 0)
      
      const [horaFin, minFin] = horario.end.split(':').map(Number)
      const bloqueEnd = new Date(year, month - 1, day)
      bloqueEnd.setHours(horaFin, minFin, 0)

      // Verificar solapamiento: (StartA < EndB) and (EndA > StartB)
      const isOccupied = (bloqueStart < resEnd && bloqueEnd > resStart)
      
      return isOccupied
    } catch (e) {
      console.error("Error validando reserva:", e)
      return false
    }
  })

  if (ocupado) return 'ocupado'
  if (bloqueSeleccionado.value === bloque) return 'seleccionado'
  
  return 'disponible'
}

function getTextoEstado(bloque: Bloque, horario: { start: string; end: string }) {
  const estado = getEstadoBloque(bloque, horario)
  const textos: Record<string, string> = {
    'disponible': 'Disponible',
    'ocupado': 'Ocupado',
    'pasado': 'No disponible',
    'seleccionado': 'Seleccionado'
  }
  return textos[estado] || ''
}

function seleccionarBloque(bloque: Bloque, horario: { start: string; end: string }) {
  const estado = getEstadoBloque(bloque, horario)
  if (estado === 'disponible') {
    bloqueSeleccionado.value = bloque
  } else if (estado === 'seleccionado') {
    // Opcional: Deseleccionar si ya está seleccionado
    bloqueSeleccionado.value = null
  }
}

function enviarSolicitud() {
  if (!bloqueSeleccionado.value || !fechaSeleccionada.value || !props.sala) return

  const horario = bloquesHorarios[bloqueSeleccionado.value]
  
  // Construir fechas ISO usando la fecha LOCAL
  const [year, month, day] = fechaSeleccionada.value.split('-').map(Number)
  
  const start = new Date(year, month - 1, day)
  const [hIni, mIni] = horario.start.split(':').map(Number)
  start.setHours(hIni, mIni, 0)

  const end = new Date(year, month - 1, day)
  const [hFin, mFin] = horario.end.split(':').map(Number)
  end.setHours(hFin, mFin, 0)

  // Ajuste para enviar la hora local tal cual (sin conversión a UTC)
  // Restamos el offset (en minutos) para que al hacer toISOString() quede la hora local
  const startISO = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString()
  const endISO = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString()

  try {
    createReservation({
      input: {
        room_id: Number(props.sala.id),
        start_time: startISO,
        end_time: endISO,
        purpose: motivoSeleccionado.value
      }
    })
    Swal.fire('Éxito', 'Solicitud de reserva enviada con éxito', 'success')
    bloqueSeleccionado.value = null
    motivoSeleccionado.value = ''
    refetch()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al crear la reserva', 'error')
  }
}

// Resetear selección si cambia la sala
watch(() => props.sala, () => {
  bloqueSeleccionado.value = null
  fechaSeleccionada.value = ''
})

// Resetear bloque si cambia la fecha
watch(fechaSeleccionada, () => {
  bloqueSeleccionado.value = null
})
</script>

<style scoped>
.detalle-sala {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.fecha-selector-container {
  margin: 20px 0;
}

.input-fecha {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: 10px;
}

.grid-bloques {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.bloque-item {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s;
}

.bloque-nombre { font-weight: bold; font-size: 1.1em; }
.bloque-hora { font-size: 0.9em; color: #666; margin: 5px 0; }
.bloque-estado { font-size: 0.85em; font-weight: bold; }

/* Estados */
.disponible {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
  color: #2e7d32;
  cursor: pointer;
}
.disponible:hover { background-color: #c8e6c9; }

.ocupado {
  background-color: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
  cursor: not-allowed;
  opacity: 0.8;
}

.pasado {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

.seleccionado {
  background-color: #e3f2fd;
  border-color: #2196f3;
  color: #1565c0;
  box-shadow: 0 0 0 2px #2196f3;
  cursor: pointer;
}

.formulario-reserva {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.campo-motivo {
  margin: 15px 0;
}

.motivo-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-enviar {
  width: 100%;
  padding: 10px;
  background-color: #002060;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-enviar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.mensaje-ayuda {
  text-align: center;
  color: #666;
  margin: 20px 0;
  font-style: italic;
}
</style>
