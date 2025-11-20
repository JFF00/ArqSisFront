<template>
  <div class="detalle-sala">
    <h2>{{ sala.nombre }}</h2>
    <p><strong>Capacidad:</strong> {{ sala.capacidad }}</p>

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
                :class="['cuadro-estado', disponibilidad[bloque][dia]]"
                @click="
                  disponibilidad[bloque][dia] === 'disponible' && seleccionarBloque(bloque, dia)
                "
                :style="{
                  cursor: disponibilidad[bloque][dia] === 'disponible' ? 'pointer' : 'not-allowed',
                }"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mostrar lo seleccionado -->
    <div v-if="seleccion.bloque" class="seleccion-info">
      🟢 Seleccionaste: <strong>{{ seleccion.sala }}</strong> — Bloque
      <strong>{{ seleccion.bloque }}</strong> — Día
      <strong>{{ seleccion.dia }}</strong>
    </div>

    <!-- Selector de fechas -->
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
import { ref } from 'vue'
import type { Sala } from '@/interfaces/salas'

const { sala, disponibilidad } = defineProps<{
  sala: Sala
  disponibilidad: any
}>()

type Dia = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'
type Bloque = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

const dias: Dia[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
const bloques: Bloque[] = ['A', 'B', 'C', 'D', 'E', 'F']

const fechasDisponibles = ref<string[]>([])
const fechaSeleccionada = ref('')

const motivoSeleccionado = ref('')
// Guarda la selección hecha por el usuario
const seleccion = ref({
  sala: '',
  bloque: '',
  dia: '',
})

function seleccionarBloque(bloque: Bloque, dia: Dia) {
  seleccion.value = {
    sala: sala.nombre,
    bloque,
    dia,
  }

  fechasDisponibles.value = obtenerProximasFechas(dia)
  console.log('SELECCIÓN:', seleccion.value)
}
function formatearFechaLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function obtenerProximasFechas(dia: string, cantidad = 4): string[] {
  const diasIndice: Record<string, number> = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
  }

  const hoy = new Date()
  const hoyDia = hoy.getDay() // 0 domingo, 1 lunes...

  const targetIndex = diasIndice[dia]

  let diff = targetIndex - hoyDia
  if (diff < 0) diff += 7 // siguiente semana si ya pasó

  const fechas: string[] = []

  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + diff + i * 7)
    fechas.push(formatearFechaLocal(fecha)) // ← YA NO USA UTC
  }

  return fechas
}

function enviarSolicitud() {
  alert(`
Solicitando sala ${seleccion.value.sala}
Fecha: ${fechaSeleccionada.value}
Bloque: ${seleccion.value.bloque}
Día: ${seleccion.value.dia}
Motivo: ${motivoSeleccionado.value}
  `)
}
</script>

<style scoped>
.detalle-sala {
  font-family: 'Cal Sans', sans-serif;
}

.tabla-style {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  border: 1px solid #ccc;
  padding: 4px;
  text-align: center;
}

.cuadro-estado {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin: 0 auto;
}

/* Colores */
.disponible {
  background-color: #4caf50;
}

.ocupado {
  background-color: #f44336;
}

.reservado {
  background-color: #ff9800;
}

.seleccion-info {
  margin-top: 12px;
  padding: 10px;
  background: #e8ffe8;
  border-left: 4px solid #4caf50;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
}
.btn-enviar {
  margin-top: 16px;
  padding: 10px 20px;
  font-family: 'Outfit', sans-serif;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.select {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
}
</style>
