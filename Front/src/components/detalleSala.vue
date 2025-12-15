<template>
  <div class="detalle-sala">
    <h2>{{ sala?.nombre }}</h2>
    <p><strong>Capacidad:</strong> {{ sala?.capacidad }}</p>

    <div class="tabla-container">
      <table class="tabla-style">
        <thead>
          <tr>
            <th>Bloque</th>
            <th v-for="dia in dias" :key="dia">{{ dia }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="bloque in bloques" :key="bloque">
            <th>{{ bloque }}</th>
            <td v-for="dia in dias" :key="dia">
              <div
                :class="['cuadro-estado', disponibilidadColor[bloque]?.[dia] || 'disponible']"
                @click="seleccionarBloqueSiDisponible(bloque, dia)"
                :style="{
                  cursor:
                    (disponibilidadColor[bloque]?.[dia] || 'disponible') === 'disponible'
                      ? 'pointer'
                      : 'not-allowed',
                }"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="seleccion.bloque" class="seleccion-info">
      Seleccionaste: <strong>{{ seleccion.sala }}</strong> — Bloque
      <strong>{{ seleccion.bloque }}</strong> — Día
      <strong>{{ seleccion.dia }}</strong>
    </div>

    <div v-if="fechasDisponibles.length" class="fecha-selector">
      <h3 class="select">Selecciona una fecha y el motivo</h3>

      <select v-model="fechaSeleccionada">
        <option disabled value="">Selecciona fecha</option>
        <option v-for="f in fechasDisponibles" :key="f">{{ f }}</option>
      </select>

      <select v-model="motivoSeleccionado" class="motivo-select">
        <option disabled value="">Motivo</option>
        <option value="ayudantías">Ayudantías</option>
        <option value="reunión">Reunión</option>
        <option value="estudios">Estudios</option>
        <option value="otro">Otro</option>
      </select>
    </div>

    <button v-if="fechaSeleccionada" class="btn-enviar" @click="enviarSolicitud">
      Enviar solicitud
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Sala } from '@/interfaces/salas'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { CREATE_RESERVATION } from '@/graphql/reservas/mutationReservas'
import { LIST_RESERVATIONS } from '@/graphql/reservas/queryReservas'

type Dia = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'
type Bloque = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

type Reserva = {
  id: number
  user_uid: string
  user: { nombreCompleto: string; email: string }
  status: 'approved' | 'pending'
  purpose: string
  room_id: number
  start_time: string
  end_time: string
  created_at: string
}

const { sala } = defineProps<{ sala: Sala | null }>()

const bloquesHorarios: Record<Bloque, { start: string; end: string }> = {
  A: { start: '08:10', end: '09:40' },
  B: { start: '09:55', end: '11:25' },
  C: { start: '11:40', end: '13:10' },
  D: { start: '14:30', end: '16:00' },
  E: { start: '16:15', end: '17:45' },
  F: { start: '18:00', end: '19:30' },
}

const dias: Dia[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
const bloques: Bloque[] = ['A', 'B', 'C', 'D', 'E', 'F']

const fechasDisponibles = ref<string[]>([])
const fechaSeleccionada = ref('')
const motivoSeleccionado = ref('')

const seleccion = reactive({ sala: '', bloque: '', dia: '' })

// --- QUERY ---
const { result: reservasResult, refetch } = useQuery(LIST_RESERVATIONS, { input: {} })

// --- MUTATION ---
const { mutate: createReservation, onDone, onError } = useMutation(CREATE_RESERVATION)

function isThisWeek(date: Date): boolean {
  const hoy = new Date()
  const primerDiaSemana = new Date(hoy)
  primerDiaSemana.setDate(hoy.getDate() - hoy.getDay() + 1) // lunes
  primerDiaSemana.setHours(0, 0, 0, 0)

  const ultimoDiaSemana = new Date(primerDiaSemana)
  ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6)
  ultimoDiaSemana.setHours(23, 59, 59, 999)

  return date >= primerDiaSemana && date <= ultimoDiaSemana
}

onDone((result) => {
  alert(
    `Reserva creada con éxito! ID: ${result.data.createReservation.id} - Estado: ${result.data.createReservation.status}`,
  )
  fechaSeleccionada.value = ''
  motivoSeleccionado.value = ''
  seleccion.sala = ''
  seleccion.bloque = ''
  seleccion.dia = ''
  refetch()
})

onError((error) => {
  console.error(error)
  alert('Error al crear la reserva: ' + error.message)
})

function seleccionarBloqueSiDisponible(bloque: Bloque, dia: Dia) {
  const estado = disponibilidadColor.value?.[bloque]?.[dia] || 'disponible'
  if (estado === 'disponible') seleccionarBloque(bloque, dia)
}

function seleccionarBloque(bloque: Bloque, dia: Dia) {
  seleccion.sala = sala?.nombre || ''
  seleccion.bloque = bloque
  seleccion.dia = dia
  fechasDisponibles.value = obtenerProximasFechas(dia)
}

function formatearFechaLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function obtenerProximasFechas(dia: Dia, cantidad = 4): string[] {
  const diasIndice: Record<Dia, number> = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
  }
  const hoy = new Date()
  const hoyDia = hoy.getDay()
  const targetIndex = diasIndice[dia]
  if (targetIndex === undefined) return []

  let diff = targetIndex - hoyDia
  if (diff < 0) diff += 7

  const fechas: string[] = []
  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + diff + i * 7)
    fechas.push(formatearFechaLocal(fecha))
  }
  return fechas
}

function enviarSolicitud() {
  if (!fechaSeleccionada.value || !seleccion.bloque || !sala) return

  const bloqueInfo = bloquesHorarios[seleccion.bloque as Bloque]
  if (!bloqueInfo) return

  const startDateTime = new Date(`${fechaSeleccionada.value}T${bloqueInfo.start}:00`)
  const endDateTime = new Date(`${fechaSeleccionada.value}T${bloqueInfo.end}:00`)

  createReservation({
    input: {
      room_id: Number(sala.id),
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      purpose: motivoSeleccionado.value || 'Reserva desde Front',
    },
  })
}

// --- Computed ---
const disponibilidadColor = computed(() => {
  const reservas: Reserva[] = reservasResult.value?.listReservations?.reservations || []
  const disponibilidad: Record<Bloque, Record<Dia, string>> = {} as Record<
    Bloque,
    Record<Dia, string>
  >

  reservas.forEach((r) => {
    if (!sala || r.room_id !== Number(sala.id)) return

    const fecha = new Date(r.start_time)
    if (!isThisWeek(fecha)) return // <- Filtramos solo esta semana

    const diaMap: Record<number, Dia> = {
      1: 'lunes',
      2: 'martes',
      3: 'miercoles',
      4: 'jueves',
      5: 'viernes',
    }
    const dia = diaMap[fecha.getDay()]
    if (!dia) return

    const hora = fecha.getHours()
    const min = fecha.getMinutes()

    let bloque: Bloque | undefined
    for (const [b, h] of Object.entries(bloquesHorarios)) {
      const [startH, startM] = h.start.split(':').map(Number)
      const [endH, endM] = h.end.split(':').map(Number)
      if (startH === undefined || startM === undefined || endH === undefined || endM === undefined)
        continue
      const start = startH * 60 + startM
      const end = endH * 60 + endM
      const actual = hora * 60 + min
      if (actual >= start && actual < end) {
        bloque = b as Bloque
        break
      }
    }

    if (!bloque) return

    if (!disponibilidad[bloque]) disponibilidad[bloque] = {} as Record<Dia, string>

    if (r.status === 'approved') disponibilidad[bloque][dia] = 'ocupado'
    else if (r.status === 'pending' && disponibilidad[bloque][dia] !== 'ocupado')
      disponibilidad[bloque][dia] = 'reservado'
    else if (!disponibilidad[bloque][dia]) disponibilidad[bloque][dia] = 'disponible'
  })

  return disponibilidad
})
</script>

<style scoped>
/* CONTENEDOR PRINCIPAL */
.detalle-sala {
  font-family: 'Outfit', sans-serif;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* TÍTULO DE LA SALA */
.detalle-sala h2 {
  font-family: 'Cal Sans', sans-serif;
  font-size: 2rem;
  margin-bottom: 10px;
  text-align: center;
}

/* TEXTO PRINCIPAL */
.detalle-sala p {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* CONTENEDOR DE TABLA */
.tabla-container {
  margin-top: 1.5rem;
  overflow-x: auto;
}

/* TABLA */
.tabla-style {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.95rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* HEADERS */
th {
  background: #f4f4f4;
  font-family: 'Cal Sans', sans-serif;
  font-size: 0.9rem;
  padding: 10px;
}

/* CELDAS */
td {
  padding: 6px;
  border: 1px solid #e0e0e0;
}

/* BLOQUES CUADRADOS */
.cuadro-estado {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  margin: 0 auto;
  transition: transform 0.15s ease;
}

.cuadro-estado:hover {
  transform: scale(1.1);
}

/* COLORES DE ESTADO */
.disponible {
  background-color: #49b86c;
}
.ocupado {
  background-color: #ef5350;
}
.reservado {
  background-color: #ffb74d;
}

/* INFO DE SELECCIÓN */
.seleccion-info {
  margin-top: 20px;
  padding: 12px 14px;
  background: #e8ffe8;
  border-left: 5px solid #4caf50;
  font-family: 'Outfit', sans-serif;
  border-radius: 6px;
  font-size: 15px;
}

/* SELECTORES DE FECHA Y MOTIVO */
.fecha-selector {
  margin-top: 20px;
  text-align: center;
}

.select {
  font-family: 'Cal Sans', sans-serif;
  font-weight: 600;
  margin-bottom: 10px;
}

/* SELECT MODERNO */
select {
  padding: 10px;
  width: 70%;
  max-width: 300px;
  margin: 6px 0;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  background: white;
  transition: all 0.2s ease;
}

select:focus {
  border-color: #4caf50;
  box-shadow: 0 0 6px rgba(76, 175, 80, 0.4);
  outline: none;
}

/* BOTÓN */
.btn-enviar {
  margin-top: 22px;
  padding: 12px 24px;
  font-family: 'Outfit', sans-serif;
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
}

.btn-enviar:hover {
  background-color: #43a047;
}

.btn-enviar:active {
  transform: scale(0.97);
}
</style>
