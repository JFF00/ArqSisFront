<template>
  <div class="full-container">
    <div class="table-container">
      <h1 class="title">Listado de Salas</h1>
      <table class="table">
        <thead class="table-head">
          <tr>
            <th>Sala</th>
            <th>Capacidad</th>
            <th>Ver Disponibilidad</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="sala in salas" :key="sala.id">
            <td>{{ sala.nombre }}</td>
            <td>{{ sala.capacidad }}</td>
            <td>
              <i class="fa-regular fa-eye" @click="abrirDetalle(sala)"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="detalle-container" v-if="mostrarDetalle">
      <DetalleSala
        :sala="salaSeleccionada"
        :disponibilidad="disponibilidad[salaSeleccionada?.nombre] || disponibilidadDefault"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { apolloClient } from '@/apollo'
import { GET_SALAS } from '@/graphql/salas/querySalas'
import DetalleSala from '@/components/detalleSala.vue'
import type { Sala } from '@/interfaces/salas'

// Estados
const salas = ref<Sala[]>([])
const mostrarDetalle = ref(false)
const salaSeleccionada = ref<Sala | null>(null)

// Disponibilidad simulada por defecto (todo disponible)
const disponibilidadDefault = {
  A: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'disponible',
  },
  B: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'disponible',
  },
  C: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'disponible',
  },
  D: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'disponible',
  },
  E: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'disponible',
  },
  F: {
    lunes: 'disponible',
    martes: 'disponible',
    miercoles: 'disponible',
    jueves: 'disponible',
    viernes: 'disponible',
  },
}

// Disponibilidad específica (ejemplo)
const disponibilidad = reactive({
  'X-107': {
    A: {
      lunes: 'disponible',
      martes: 'ocupado',
      miercoles: 'reservado',
      jueves: 'disponible',
      viernes: 'ocupado',
    },
    // ... rellenar estructura completa si se desea
  },
})

// Fetch GraphQL
const fetchSalas = async () => {
  try {
    const { data } = await apolloClient.query({
      query: GET_SALAS,
      fetchPolicy: 'network-only',
    })
    salas.value = data.salas
  } catch (error) {
    console.error('Error cargando salas:', error)
  }
}

// Abrir detalle
function abrirDetalle(sala: Sala) {
  salaSeleccionada.value = sala
  mostrarDetalle.value = true
}

// Ejecutar al montar
onMounted(() => {
  fetchSalas()
})
</script>

<style>
/* tu CSS (mantén .fa-eye cursor pointer) */
.title {
  font-family: 'Cal Sans', sans-serif;
  font-weight: bolder;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

/* CONTENEDOR PRINCIPAL → 2 COLUMNAS MISMA ALTURA */
.full-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  height: 80vh; /* ← MISMA ALTURA PARA AMBAS COLUMNAS */
  box-sizing: border-box;
}

/* COLUMNA DE LA TABLA */
.table-container {
  width: 40%;
  overflow-y: auto;
  height: 100%; /* ← SE AJUSTA A LA ALTURA DEL PADRE */
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* TABLA */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #c8c6c6;
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
}

/* ENCABEZADO */
.table-head,
th {
  background-color: #f5f2f2;
  color: #4d4a4a;
  font-family: 'Cal Sans', sans-serif;
  padding: 12px;
  border: 1px solid #c2bdbd;
  position: sticky;
  top: 0;
}

/* CUERPO */
td {
  border: 1px solid #dfd9d9;
  padding: 8px;
  text-align: center;
  font-family: 'Outfit', sans-serif;
}

.table-body {
  border: 1px solid #979292;
}

/* ICONO */
.fa-eye {
  cursor: pointer;
  color: #4d4a4a;
  transition: 0.15s;
}

.fa-eye:hover {
  color: #2d8cff;
}

/* COLUMNA DEL DETALLE */
.detalle-container {
  width: 50%;
  height: 100%; /* ← MISMA ALTURA QUE LA TABLA */
  overflow-y: auto; /* ← SCROLL INTERNO */
  background: #ffffff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
</style>
