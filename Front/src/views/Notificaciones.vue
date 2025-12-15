<template>
  <div class="contenedorPrincipal">
    <h1 class="title">Notificaciones</h1>

    <p v-if="notificaciones.length === 0" class="sinNotificaciones">
      No tienes notificaciones por ahora.
    </p>

    <div v-else class="listaNotificaciones">
      <div
        v-for="(item, index) in notificaciones"
        :key="index"
        class="notificacion"
        :class="item.estado"
      >
        <!-- FECHA A LA IZQUIERDA -->
        <span class="fechaNotificacion">
          {{ formatearFecha(item.fecha) }}
        </span>

        <h3 class="notificacionTitulo">{{ item.titulo }}</h3>

        <p class="notificacionDescripcion">{{ item.descripcion }}</p>

        <span class="estado">
          {{ item.estado === 'aprobada' ? 'Aprobada' : 'Rechazada' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/* Ejemplo: puedes reemplazar esto con tus datos reales */
const notificaciones = ref([
  {
    titulo: 'Solicitud sala 101',
    descripcion: 'Tu solicitud fue aprobada.',
    estado: 'aprobada',
    fecha: '2025-01-12T14:30:00',
  },
  {
    titulo: 'Reserva sala reuniones',
    descripcion: 'Solicitud rechazada por disponibilidad.',
    estado: 'rechazada',
    fecha: '2025-01-10T10:05:00',
  },
])

/* Función para mostrar la fecha en formato bonito */
const formatearFecha = (fecha) => {
  const f = new Date(fecha)
  return f.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style>
.contenedorPrincipal {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.title {
  margin-bottom: 1rem;
  text-align: center;
}

.sinNotificaciones {
  font-size: 1rem;
  color: #555;
}

/* Lista */
.listaNotificaciones {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tarjetas */
.notificacion {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* FECHA ESTILO */
.fechaNotificacion {
  font-size: 0.8rem;
  color: #888; /* gris suave */
  margin-bottom: 0.3rem;
}

/* Títulos */
.notificacionTitulo {
  margin: 0 0 0.4rem 0;
  font-size: 1.1rem;
}

/* Texto */
.notificacionDescripcion {
  margin: 0 0 0.5rem 0;
  color: #555;
}

/* Estado */
.estado {
  font-weight: bold;
  margin-top: 0.5rem;
}

.aprobada {
  border-left: 6px solid #4caf50;
}

.rechazada {
  border-left: 6px solid #e53935;
}
</style>
