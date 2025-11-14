<template>
  <div class="container-calendario">
  <!-- Calendario siempre con ancho fijo -->
  <div class="calendar-panel">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>

  <!-- Panel derecho: formulario lateral -->
  <div v-if="mostrarFormulario" class="right-panel-form">
    <h2>Solicitud de Reserva de Sala</h2>
    <p>Fecha seleccionada: {{ fechaSeleccionada }}</p>

    <form @submit.prevent="cerrarFormulario">
      <label>Nombre del responsable:</label>
      <input type="text" />

      <label>Bloque a reservar:</label>
      <select>
        <option>A</option>
        <option>B</option>
        <option>C</option>
      </select>

      <label>Salas disponibles:</label>
      <select>
        <option>Sala 15</option>
        <option>Sala 63</option>
        <option>Sala 11</option>
      </select>

      <div class="botones">
        <button type="submit">Guardar</button>
        <button type="button" @click="cerrarFormulario">Cancelar</button>
      </div>
    </form>
  </div>
</div>


</template>

<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import {ref, onMounted} from 'vue'

const calendarRef = ref(null)


/*Formulario  */
const mostrarFormulario = ref(false)
const fechaSeleccionada = ref('')

const handleDateClick = (info) => {
  const fecha= new Date(info.dateStr);
  const dia= fecha.getUTCDate()
  if(dia==0){
    alert('Domingos no está disponible la reserva de salas.')
    return
  }
  
  fechaSeleccionada.value = info.dateStr
  mostrarFormulario.value = true
}

const cerrarFormulario = () => {
  mostrarFormulario.value = false
}


const calendarOptions = {
  plugins: [timeGridPlugin,dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  dateClick: handleDateClick,
    datesSet(info) {
    const titleEl = document.querySelector('.fc-toolbar-title')
    if (titleEl) {
      const visibleDate = new Date(info.start.setDate(info.start.getDate() + 15)) // toma el centro del mes visible
      const formatted = visibleDate
        .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        .replace(' de ', ', ')
      titleEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }
  },
   customButtons: {
    regresarBtn: {
      text: 'Volver al mes',
      click() {
        const calendarApi = calendarRef.value.getApi()
        calendarApi.changeView('dayGridMonth')
      }
    }
  },
  selectable: true,
  editable: true,
  height:550,
  firstDay:1,
  locale:esLocale,
  allDaySlot:false,
  slotDuration:'01:30:00',
  slotMinTime:'08:10:00',
  slotMaxTime:'19:30:00',
  headerToolbar:{
    left:'prev',
    center:'title,today', 
    right:'next',
  },
  events: [
  { title: 'Bloque A', startTime: '08:15', endTime: '09:45', daysOfWeek: [1,2,3,4,5], display: 'background', color: '#cce5ff' },
  { title: 'Bloque B', startTime: '10:00', endTime: '11:30', daysOfWeek: [1,2,3,4,5], display: 'background', color: '#cce5ff' },
  // etc.
]


}
</script>

<style>
.title {
  font-weight: lighter;
  font-size: 3em;
  margin-left: 3%;
}
.container-calendario {
    display: flex;
    flex-direction: row;
    gap: 20px;
}
.container-calendario {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 16px;
}

.calendar-panel {
  width: 800px;           /* calendario ocupa más espacio */
}

.right-panel-form {
  flex: 1;           /* panel derecho más estrecho */
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  max-width: 400px;  /* opcional, ancho máximo */
  height: fit-content;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.fc{
    font-family: "Outfit", sans-serif;
}

.fc-toolbar-title{
    text-transform: capitalize;
    font-weight: bolder;
}
.fc-toolbar-title::after{
    content:"";
}
.fc-today-button{
    left: 90px !important;
}
.fc-daygrid-day-number{
    color:rgb(99, 96, 96)
}
.fc-daygrid-day:hover{
    background-color:rgb(150, 144, 144);
    cursor: pointer;
    transition: background-color 0.2s ease;
}
.fc-daygrid-day:hover .fc-daygrid-day-number {
  color: #ffffff;
  transition: color 0.2s ease;
}
.fc-daygrid-day-number:hover {
  background: none !important;
  color: white !important;
  cursor: default !important;
}
.fc-col-header-cell-cushion { /* LUN,MAR,MIE*/ 
    color:rgb(64, 63, 83);
    font-weight: 600;
    font-family: "Inter",sans-serif;
}
.popup-fondo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.popup-contenido {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: aparecer 0.2s ease;
}
@keyframes aparecer {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.popup-contenido h2 {
  margin-bottom: 1rem;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

input, select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.botones {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button[type="submit"] {
  background-color: #2563eb;
  color: white;
}

button[type="button"] {
  background-color: #aaa;
  color: white;
}
</style>
