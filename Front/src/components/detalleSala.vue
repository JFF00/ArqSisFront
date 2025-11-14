<template>
  <div class="detalle-sala">
    <h2>{{ sala.nombre }}</h2>
    <p><strong>Capacidad:</strong> {{ sala.capacidad }}</p>
    <p><strong>Ubicación:</strong> {{ sala.ubicacion || '-' }}</p>
    <p><strong>Descripción:</strong> {{ sala.descripcion || '-' }}</p>
    <p><strong>Recursos:</strong> {{ sala.recursos ? sala.recursos.join(', ') : '-' }}</p>

    <div class="tabla-container">
      <table class="tabla-style">
        <thead>
          <tr>
            <th></th>
            <th>Lunes</th>
            <th>Martes</th>
            <th>Miércoles</th>
            <th>Jueves</th>
            <th>Viernes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bloque in bloques" :key="bloque">
            <th>{{ bloque }}</th>
            <td v-for="(estado, index) in disponibilidad[bloque]" :key="index">
              <div
                :class="['cuadro-estado', estado]"
                @click="cambiarEstado(bloque, index)"
                title="Haz click para cambiar el estado"
                style="cursor: pointer;"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="acciones">
  <button @click="guardarCambios">Guardar cambios</button>
</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Sala } from '@/interfaces/salas';

// Props
defineProps<{ sala: Sala }>();

// Tipos
type EstadoBloque = 'disponible' | 'ocupado' | 'reservado';
type Bloques = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

const estados: EstadoBloque[] = ['disponible', 'ocupado', 'reservado'];

// lista de bloques utilizada en el template
const bloques: Bloques[] = ['A', 'B', 'C', 'D', 'E', 'F'];

const disponibilidad = ref<Record<Bloques, EstadoBloque[]>>({
  A: ['disponible', 'ocupado', 'disponible', 'reservado', 'disponible'] as const,
  B: ['ocupado', 'ocupado', 'disponible', 'disponible', 'disponible'] as const,
  C: ['disponible', 'disponible', 'disponible', 'ocupado', 'reservado'] as const,
  D: ['disponible', 'disponible', 'ocupado', 'ocupado', 'disponible'] as const,
  E: ['reservado', 'disponible', 'disponible', 'disponible', 'ocupado'] as const,
  F: ['disponible', 'ocupado', 'reservado', 'disponible', 'disponible'] as const,
});

const cambiarEstado = (bloque: Bloques, index: number) => {
  const fila = disponibilidad.value[bloque] as EstadoBloque[]; // forzamos tipo mutable
  // validar índice y existencia del estado actual
  if (index < 0 || index >= fila.length) return;
  const estadoActual = fila[index]; // ahora garantizado definido
  if (estadoActual === undefined) return;
  const idx = estados.indexOf(estadoActual);
  const nextEstado = estados[(idx + 1) % estados.length];
  if (nextEstado !== undefined) {
    fila[index] = nextEstado;
  }
};


const guardarCambios = () => {
  // Aquí puedes enviar disponibilidad.value a tu backend
  console.log('Disponibilidad actual:', disponibilidad.value);

  // Ejemplo: si tuvieras un API:
  // fetch('/api/salas/' + sala.id + '/disponibilidad', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(disponibilidad.value)
  // }).then(res => console.log('Guardado!', res))
  //   .catch(err => console.error(err));

  alert('Cambios guardados con éxito!');
};
</script>

<style scoped>
.tabla-style{
    font-family: "Outfit", sans-serif;
}
.detalle-sala {
  border-radius: 8px;
  padding: 16px;
  min-height: 400px;
}

.tabla-container {
  margin-top: 16px;
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #ccc;
  text-align: center;
  padding: 4px;
}
.acciones {
  margin-top: 16px;
  text-align: right;
}

.acciones button {
  padding: 8px 16px;
  background-color: #2196f3;
  font-family: "Outfit", sans-serif;
  font-weight: light;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.acciones button:hover {
  background-color: #1976d2;
}
.cuadro-estado {
  width: 24px;
  height: 24px;
  margin: 0 auto;
  border-radius: 4px;
  transition: all 0.2s;
}

.cuadro-estado.disponible {
  background-color: #4caf50; /* verde */
}

.cuadro-estado.ocupado {
  background-color: #f44336; /* rojo */
}

.cuadro-estado.reservado {
  background-color: #ff9800; /* naranja */
}
</style>
