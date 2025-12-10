<template>
  <div class="contenedorPrincipal">
    <h1 class="title">Observaciones por sala</h1>

    <!-- Selector de sala -->
    <div class="formContainer">
      <label for="opciones" class="labelSelect">Selecciona una sala</label>
      <select v-model="opcionSeleccionada" id="opciones" name="opciones" class="select">
        <option value="">-- Selecciona --</option>

        <!-- 🔥 Salas cargadas desde GraphQL -->
        <option v-for="sala in salas" :key="sala.id" :value="sala.id">
          {{ sala.nombre }}
        </option>
      </select>
    </div>

    <!-- Contenido solo si selecciona sala -->
    <div v-if="opcionSeleccionada" class="contenidoSala">
      <h2 class="salaTitulo">
        Sala: {{ nombreSalaSeleccionada }}
      </h2>

      <!-- Sección Objetos Perdidos -->
      <div class="seccion">
  <h3 class="seccionTitulo">Objetos perdidos</h3>

  <p v-if="itemsPerdidos.length === 0" class="vacio">
    No hay objetos perdidos registrados.
  </p>

  <ul v-else>
    <li v-for="item in itemsPerdidos" :key="item.id">
      <strong>{{ item.nombre }}</strong>: {{ item.descripcion }} ({{ item.estado }})
    </li>
  </ul>
</div>

      <!-- Sección Anotaciones -->
<div class="seccion">
  <h3 class="seccionTitulo">Anotaciones</h3>

  <p v-if="notas.length === 0" class="vacio">
    No hay anotaciones para esta sala.
  </p>

  <ul v-else>
    <li v-for="nota in notas" :key="nota.id">
      <strong>{{ nota.titulo }}</strong> ({{ nota.tipo }} - {{ nota.prioridad }})<br/>
      {{ nota.contenido }} <em v-if="nota.resuelta">(Resuelta)</em>
    </li>
  </ul>
</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted,watch } from 'vue'
import { apolloClient } from '@/apollo'
import { GET_SALAS } from '@/graphql/salas/querySalas'
import { GET_ITEMS_PERDIDOS_POR_SALA } from '@/graphql/salas/querySalas'
import { GET_NOTAS_POR_SALA } from '@/graphql/salas/querySalas'
import type { Sala } from '@/interfaces/salas'
import type {Nota} from '@/interfaces/notaSala'
import type { ItemPerdido } from '@/interfaces/itemPerdido'

const opcionSeleccionada = ref('')
const salas = ref<Sala[]>([])
const itemsPerdidos = ref<ItemPerdido[]>([])
const notas = ref<Nota[]>([])


const fetchSalas = async () => {
  try {
    const { data } = await apolloClient.query({
      query: GET_SALAS,
      fetchPolicy: 'network-only'
    })
    salas.value = data.salas
  } catch (error) {
    console.error('Error cargando salas:', error)
  }
}

const fetchItemsPerdidos = async (salaId:number) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_ITEMS_PERDIDOS_POR_SALA,
      variables: { salaId },
      fetchPolicy: 'network-only',
    })
    itemsPerdidos.value = data.itemsPerdidosPorSala
  } catch (error) {
    console.error('Error cargando items perdidos:', error)
  }
}


const fetchNotas = async (salaId: number) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_NOTAS_POR_SALA,
      variables: { salaId },
      fetchPolicy: 'network-only',
    })
    notas.value = data.notasPorSala
  } catch (error) {
    console.error('Error cargando notas:', error)
  }
}

watch(opcionSeleccionada, (nuevoValor) => {
  if (nuevoValor) {
    const salaIdNum=Number(nuevoValor)
    fetchItemsPerdidos(salaIdNum)
    fetchNotas(salaIdNum)
  } else {
    itemsPerdidos.value = []
    notas.value=[] 
  }
})


// Ejecutar al montar
onMounted(() => {
  fetchSalas()
  
})

// Obtener nombre de sala seleccionada
const nombreSalaSeleccionada = computed(() => {
  const sala = salas.value.find((s: Sala) => s.id === Number(opcionSeleccionada.value))
  return sala?.nombre || ''
})

</script>

<style>
.contenedorPrincipal {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
}

.labelSelect {
  margin-bottom: 0.5rem;
}

.select {
  padding: 0.5rem;
  width: 50%;
  max-width: 400px;
}

.contenidoSala {
  margin-top: 2rem;
  width: 100%;
  max-width: 700px;
}

.salaTitulo {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.seccion {
  padding: 1rem 0;
}

.seccionTitulo {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.divider {
  height: 1px;
  background-color: #d6d6d6;
  margin: 1rem 0;
}

.vacio {
  color: #777;
  font-size: 0.95rem;
}
</style>
