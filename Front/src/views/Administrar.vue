<template>
  <div class="solicitudes-container">
    <h1 class="title">Solicitudes</h1>

    <div class="table-wrapper">
      <table class="tabla-solicitudes">
        <thead>
          <tr>
            <th>Sala</th>
            <th>Motivo</th>
            <th>Encargado</th>
            <th>Horario</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="solicitud in solicitudes" :key="solicitud.id">
            <td>{{ solicitud.sala }}</td>
            <td>{{ solicitud.motivo }}</td>
            <td>{{ solicitud.encargado }}</td>
            <td>{{ solicitud.horario }}</td>
            <td>{{ solicitud.fecha }}</td>
            <td class="acciones">
              <button class="btn aceptar" @click="aceptar(solicitud.id)">Aceptar</button>
              <button class="btn rechazar" @click="rechazar(solicitud.id)">Rechazar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Solicitud {
  id: number
  sala: string
  motivo: string
  encargado: string
  horario: string
  fecha: string
}

const solicitudes = ref<Solicitud[]>([
  {
    id: 1,
    sala: 'Sala A',
    motivo: 'Reunión académica',
    encargado: 'Juan Pérez',
    horario: 'Bloque B',
    fecha: '2025-11-25',
  },
  {
    id: 2,
    sala: 'Sala C',
    motivo: 'Capacitación',
    encargado: 'María López',
    horario: 'Bloque D',
    fecha: '2025-11-27',
  },
])

function aceptar(id: number) {
  console.log('Solicitud aceptada:', id)
  // lógica backend aquí
}

function rechazar(id: number) {
  console.log('Solicitud rechazada:', id)
  // lógica backend aquí
}
</script>

<style scoped>
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
