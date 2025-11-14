<template>
  <div class="container">
    <!-- Columna izquierda: tabla -->
    <div class="left-panel">
      <h1 class="titulo">Listado de salas</h1>
      <div class="tabla-container">
        <table class="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Capacidad</th>
              <th>Ver</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sala in salas" :key="sala.id">
              <td>{{ sala.id }}</td>
              <td>{{ sala.nombre }}</td>
              <td>{{ sala.capacidad }}</td>
              <td>
                <i class="fa-solid fa-eye" @click="seleccionarSala(sala)" style="cursor:pointer;"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>

    <!-- Columna derecha: detalle -->
    <div class="right-panel">
      <DetalleSala v-if="salaSeleccionada" :sala="salaSeleccionada" />
      <div v-else class="placeholder">
        Selecciona una sala para ver detalles
      </div>
    </div>
  </div>
</template>

<script setup lang ="ts">
import { ref } from "vue";
import type { Sala } from "@/interfaces/salas"
import DetalleSala from "@/components/detalleSala.vue";

const salaSeleccionada = ref<Sala | null>(null);
 
const salas = ref<Sala[]>([
  { id: 1, nombre: "Sala A", capacidad: 20 },
  { id: 2, nombre: "Sala B", capacidad: 15 },
  { id: 3, nombre: "Sala C", capacidad: 25 }
])

const agregarSala = () => {
  const nuevaSala = {
    id: salas.value.length + 1,
    nombre: `Sala ${String.fromCharCode(64 + salas.value.length + 1)}`,
    capacidad: Math.floor(Math.random() * 30) + 10,
    estado: "Disponible"
  }
  salas.value.push(nuevaSala)
}

const seleccionarSala = (sala: Sala) => {
  salaSeleccionada.value = sala;
};

</script>
    



<style scoped>
.container{
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 120px;
}
.tabla-container {
  width: max-content;
  min-width: 600px;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  }

.titulo {
  margin-bottom: 16px;
  text-align: center;
  font-family: 'Outfit',sans-serif;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.tabla th{
    position: sticky;
  top: 0;                  /* se mantiene en la parte superior */
  background-color: #f2f2f2;
  z-index: 1;              /* por si hay contenido que se sobrepone */
  border: 1px solid #ccc;
  padding: 8px;
  font-family:"Inter",sans-serif ;

}
.tabla td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  white-space: nowrap;
  font-family:'Inter',sans-serif ;

}

.tabla th {
  background-color: #f2f2f2;
}

.icono-columna {
  text-align: center;
}

.agregar {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #0077cc;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
    font-family:'Inter',sans-serif ;

}
.agregar:hover {
  background-color: #005fa3;
}
.left-panel{
  flex: 1;                    /* ocupa proporción del contenedor */
  display: flex;
  flex-direction: column;     /* para que botón quede debajo */
  min-width: 0;   
}
.right-panel{
  flex: 2;
 
  border-radius: 8px;
  padding: 16px;
  min-height: 400px;
  margin-left: 300px;
}
</style>