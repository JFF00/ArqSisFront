<template>
  <div class="contenedorPrincipal">
    <h1 class="title">Observaciones por sala</h1>

    <div class="formContainer">
      <label for="opciones" class="labelSelect">Selecciona una sala</label>
      <select v-model="opcionSeleccionada" id="opciones" name="opciones" class="select">
        <option value="">-- Selecciona --</option>
        <option value="1">Opción 1</option>
        <option value="2">Opción 2</option>
        <option value="3">Opción 3</option>
      </select>
    </div>

    <h2 v-if="opcionSeleccionada" class="seleccionMensaje">
      Seleccionaste la opción {{ opcionSeleccionada }}
    </h2>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const opcionSeleccionada = ref('')
</script>

<style>
.contenedorPrincipal {
  display: flex;
  flex-direction: column; /* apila elementos verticalmente */
  align-items: center;    /* centra horizontalmente */
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
}

.title {
  text-align: center;
  margin-bottom: 1rem;
}

.formContainer {
  display: flex;
  flex-direction: column;
  align-items: center; /* centra el label y select */
  margin-bottom: 1.5rem;
  width: 100%;
}

.labelSelect {
  margin-bottom: 0.5rem;
}

.select {
  padding: 0.5rem;
  width: 50%;       /* ancho del select */
  max-width: 400px;
}

.seleccionMensaje {
  text-align: center;
  font-weight: normal;
  width: 100%;
}
</style>
