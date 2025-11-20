<template>
  <div class="full-container">
    <div class="table-container">
      <h1 class="title">Listado de Salas</h1>
      <table class="table">
        <thead class="table-head">
          <tr>
            <th>ID</th>
            <th>Sala</th>
            <th>Capacidad</th>
            <th>Ver Disponibilidad</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="sala in salas" :key="sala.id">
            <td>{{ sala.id }}</td>
            <td>{{ sala.nombre }}</td>
            <td>{{ sala.capacidad }}</td>
            <td>
              <i class="fa-regular fa-eye" @click="abrirDetalle(sala)"></i>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- PASO CRÍTICO: pasar disponibilidad + sala -->
    </div>
    <div class="detalle-container">
      <DetalleSala
        v-if="mostrarDetalle"
        :sala="salaSeleccionada"
        :disponibilidad="disponibilidad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sala } from '@/interfaces/salas'
import DetalleSala from '@/components/detalleSala.vue' // nombre consistente
import { ref, reactive } from 'vue'

const mostrarDetalle = ref(false)
const salaSeleccionada = ref<Sala | null>(null)

// uso reactive para mantener reactividad si el hijo modifica disponibilidad
const disponibilidad = reactive({
  A: {
    lunes: 'disponible',
    martes: 'ocupado',
    miercoles: 'reservado',
    jueves: 'disponible',
    viernes: 'ocupado',
  },
  B: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'ocupado',
    jueves: 'reservado',
    viernes: 'disponible',
  },
  C: {
    lunes: 'reservado',
    martes: 'ocupado',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'ocupado',
  },
  D: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'ocupado',
    viernes: 'reservado',
  },
  E: {
    lunes: 'ocupado',
    martes: 'disponible',
    miercoles: 'reservado',
    jueves: 'disponible',
    viernes: 'disponible',
  },
  F: {
    lunes: 'disponible',
    martes: 'ocupado',
    miercoles: 'disponible',
    jueves: 'reservado',
    viernes: 'ocupado',
  },
})

const salas: Sala[] = [
  {
    id: 1,
    nombre: 'Sala A',
    capacidad: 20,
    ubicacion: 'Edificio Central, Piso 1',
    descripcion: 'Sala equipada para clases pequeñas',
    recursos: ['Proyector', 'Pizarra', 'Aire acondicionado'],
  },
  {
    id: 2,
    nombre: 'Sala B',
    capacidad: 35,
    ubicacion: 'Edificio Ciencias, Piso 2',
    descripcion: 'Sala multimedia con audio reforzado',
    recursos: ['Proyector', 'Sistema de audio', 'Computador'],
  },
  {
    id: 3,
    nombre: 'Sala C',
    capacidad: 50,
    ubicacion: 'Edificio Biblioteca, Piso 3',
    descripcion: 'Auditorio pequeño',
    recursos: ['Micrófonos', 'Proyector', 'Butacas'],
  },
  {
    id: 1,
    nombre: 'Sala A',
    capacidad: 20,
    ubicacion: 'Edificio Central, Piso 1',
    descripcion: 'Sala equipada para clases pequeñas',
    recursos: ['Proyector', 'Pizarra', 'Aire acondicionado'],
  },
  {
    id: 2,
    nombre: 'Sala B',
    capacidad: 35,
    ubicacion: 'Edificio Ciencias, Piso 2',
    descripcion: 'Sala multimedia con audio reforzado',
    recursos: ['Proyector', 'Sistema de audio', 'Computador'],
  },
  {
    id: 3,
    nombre: 'Sala C',
    capacidad: 50,
    ubicacion: 'Edificio Biblioteca, Piso 3',
    descripcion: 'Auditorio pequeño',
    recursos: ['Micrófonos', 'Proyector', 'Butacas'],
  },
  {
    id: 1,
    nombre: 'Sala A',
    capacidad: 20,
    ubicacion: 'Edificio Central, Piso 1',
    descripcion: 'Sala equipada para clases pequeñas',
    recursos: ['Proyector', 'Pizarra', 'Aire acondicionado'],
  },
  {
    id: 2,
    nombre: 'Sala B',
    capacidad: 35,
    ubicacion: 'Edificio Ciencias, Piso 2',
    descripcion: 'Sala multimedia con audio reforzado',
    recursos: ['Proyector', 'Sistema de audio', 'Computador'],
  },
]

function abrirDetalle(sala: Sala) {
  salaSeleccionada.value = sala
  mostrarDetalle.value = true
}
</script>

<style>
/* tu CSS (mantén .fa-eye cursor pointer) */
.title {
  font-family: 'Cal Sans', sans-serif;
  font-weight: bolder;
  font-size: 2rem;
}
.full-container {
  margin-top: 20px;
  justify-content: center;
  display: flex;
  width: 100%;
}
.table-container {
  width: 40%;
  overflow-y: auto;
  height: 70vh;
}
.table {
  border: 1px solid #b4afafff;
  border-radius: 3px;
  border-collapse: separate;
  border-spacing: 0;
}
.table-head,
th {
  color: #4d4a4aff;
  border: 1px solid #c2bdbdff;
  background-color: #f5f2f2ff;
  padding: 15px;
  position: sticky;
  top: 0;
  z-index: 1;
}
td {
  border: 1px solid #dfd9d9ff;
  text-align: center;
  padding: 5px;
}
.table-body {
  border: 1px solid #979292ff;
}
.fa-eye {
  cursor: pointer;
  color: #4d4a4aff;
}
.detalle-container {
  width: 50%;
  margin-left: 20px;
}
</style>
