<template>
  <div class="page">
    <h1 class="page-title">Observaciones por sala</h1>

    <!-- Selector sala y Controles -->
    <div class="controls-bar">
      <div class="selector">
        <label>Selecciona una sala</label>
        <select v-model="opcionSeleccionada">
          <option value="">-- Selecciona --</option>
          <option v-for="sala in salas" :key="sala.id" :value="sala.id">
            {{ sala.nombre }}
          </option>
        </select>
      </div>

      <div v-if="authStore.canManage && opcionSeleccionada" class="history-toggle">
        <button 
          class="btn-history" 
          :class="{ active: mostrarHistorial }"
          @click="mostrarHistorial = !mostrarHistorial"
        >
          {{ mostrarHistorial ? 'Volver a Activos' : 'Ver Historial' }}
        </button>
      </div>
    </div>

    <div v-if="opcionSeleccionada" class="layout">
      <!-- PANEL OBJETOS PERDIDOS -->
      <section class="panel">
        <h2 class="panel-title">
          {{ mostrarHistorial ? 'Historial Objetos' : 'Objetos perdidos' }}
        </h2>

        <div class="cards">
          <div v-for="item in itemsFiltrados" :key="item.id" class="card">
            <h3>{{ item.nombre }}</h3>
            <p>{{ item.descripcion }}</p>

            <div class="info">
              <span v-if="item.fecha"> Fecha: {{ formatFecha(item.fecha) }} </span>

              <span v-if="item.ubicacion"> Ubicación: {{ item.ubicacion }} </span>

              <span v-if="item.reporter"> Reportado por: {{ item.reporter.nombreCompleto }} </span>
              <span v-else-if="item.reportado_por"> Reportado por: {{ item.reportado_por }} </span>
            </div>

            <div class="meta-joined">
              <span class="cat-part">
                {{ formatCategoriaItem(item.categoria) }}
              </span>
              <span class="status-part">
                {{ formatEstadoItem(item.estado) }}
              </span>
            </div>
            <!-- BOTÓN RECUPERADO -->
            <div class="card-footer">
              <button
                v-if="authStore.user?.uid === item.reportado_por && item.estado !== 'reclamado'"
                class="btn-recuperado"
                @click="marcarComoRecuperado(Number(item.id))"
              >
                Marcar como recuperado
              </button>
            </div>
          </div>

          <p v-if="itemsFiltrados.length === 0" class="empty">
            {{ mostrarHistorial ? 'No hay objetos en el historial' : 'No hay objetos registrados' }}
          </p>
        </div>

        <!-- BOTÓN FIJO (Solo visible en vista activa) -->
        <div class="sticky-footer" v-if="!mostrarHistorial">
          <button class="btn-primary" @click="mostrarFormItem = !mostrarFormItem">
            + Registrar objeto perdido
          </button>

          <div v-if="mostrarFormItem" class="form-box">
            <input v-model="nuevoItem.nombre" placeholder="Nombre del objeto" />
            <textarea v-model="nuevoItem.descripcion" placeholder="Descripción" />

            <select v-model="nuevoItem.categoria">
              <option value="ELECTRONICO">Electrónico</option>
              <option value="ROPA">Ropa</option>
              <option value="DOCUMENTO">Documento</option>
              <option value="ACCESORIO">Accesorio</option>
              <option value="OTRO">Otro</option>
            </select>

            <button class="btn-primary" @click="crearItemPerdido">Guardar</button>
          </div>
        </div>
      </section>

      <!-- DIVISOR -->
      <div class="divider"></div>

      <!-- PANEL OBSERVACIONES  -->
      <section class="panel">
        <h2 class="panel-title">
          {{ mostrarHistorial ? 'Historial Observaciones' : 'Observaciones' }}
        </h2>

        <div class="cards">
          <div v-for="nota in notasFiltradas" :key="nota.id" class="card">
            <h3>{{ nota.titulo }}</h3>
            <p>{{ nota.contenido }}</p>

            <div class="meta">
              <span class="tag" :class="`tipo-${nota.tipo}`">
                {{ formatTipoNota(nota.tipo) }}
              </span>

              <span class="tag" :class="`prioridad-${nota.prioridad}`">
                {{ formatPrioridad(nota.prioridad) }}
              </span>

              <span v-if="nota.resuelta" class="tag resuelta">Resuelta</span>
            </div>
            <div class="card-footer" v-if="authStore.isAdmin && !nota.resuelta">
              <button class="btn-resolver" @click="marcarNotaComoResuelta(Number(nota.id))">
                Resolver observación
              </button>
            </div>
          </div>

          <p v-if="notasFiltradas.length === 0" class="empty">
            {{ mostrarHistorial ? 'No hay observaciones resueltas' : 'No hay observaciones pendientes' }}
          </p>
        </div>

        <!-- BOTÓN FIJO (Solo visible en vista activa) -->
        <div class="sticky-footer" v-if="!mostrarHistorial">
          <button class="btn-primary" @click="mostrarFormNota = !mostrarFormNota">
            + Crear observación
          </button>

          <div v-if="mostrarFormNota" class="form-box">
            <input v-model="nuevaNota.titulo" placeholder="Título" />
            <textarea v-model="nuevaNota.contenido" placeholder="Contenido" />

            <select v-model="nuevaNota.prioridad">
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>

            <select v-model="nuevaNota.tipo">
              <option value="GENERAL">General</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="LIMPIEZA">Limpieza</option>
              <option value="INCIDENTE">Incidente</option>
            </select>

            <button class="btn-primary" @click="crearNota">Guardar</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { apolloClient } from '@/apollo'
import {
  GET_SALAS,
  GET_ITEMS_PERDIDOS_POR_SALA,
  GET_NOTAS_POR_SALA,
} from '@/graphql/salas/querySalas'
import { CREATE_NOTA, CREATE_ITEM_PERDIDO } from '@/graphql/salas/mutationSalas'
import type { ItemPerdido } from '@/interfaces/itemPerdido.ts'
import type { Nota } from '@/interfaces/notaSala.ts'
import type { Sala } from '@/interfaces/salas'
import { useAuthStore } from '@/stores/auth'
import { UPDATE_ITEM_PERDIDO } from '@/graphql/salas/mutationSalas.ts'
import { UPDATE_NOTA } from '@/graphql/salas/mutationSalas'
import Swal from 'sweetalert2'

const salas = ref<Sala[]>([])
const itemsPerdidos = ref<ItemPerdido[]>([])
const notas = ref<Nota[]>([])

const opcionSeleccionada = ref('')
const mostrarFormNota = ref(false)
const mostrarFormItem = ref(false)
const mostrarHistorial = ref(false)

const authStore = useAuthStore()

// Computed para filtrar items y notas
const itemsFiltrados = computed(() => {
  if (mostrarHistorial.value && authStore.canManage) {
    return itemsPerdidos.value.filter(i => i.estado?.toLowerCase() === 'reclamado')
  }
  return itemsPerdidos.value.filter(i => i.estado?.toLowerCase() !== 'reclamado')
})

const notasFiltradas = computed(() => {
  if (mostrarHistorial.value && authStore.canManage) {
    return notas.value.filter(n => n.resuelta)
  }
  return notas.value.filter(n => !n.resuelta)
})

const formatCategoriaItem = (value: string): string => {
  const map: Record<string, string> = {
    electronico: 'Electrónico',
    ropa: 'Ropa',
    documento: 'Documento',
    accesorio: 'Accesorio',
    otro: 'Otro',
  }

  return map[value] ?? value
}

const formatEstadoItem = (value: string): string => {
  const map: Record<string, string> = {
    en_custodia: 'En custodia',
    reclamado: 'Reclamado',
    eliminado: 'Eliminado',
  }

  return map[value] ?? value
}

const formatPrioridad = (value: string): string => {
  const map: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
  }

  return map[value] ?? value
}

const formatTipoNota = (value: string): string => {
  const map: Record<string, string> = {
    general: 'General',
    mantenimiento: 'Mantenimiento',
    limpieza: 'Limpieza',
    incidente: 'Incidente',
  }

  return map[value] ?? value
}

const formatFecha = (value: string): string => {
  if (!value) return ''

  const date = new Date(value)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)

  return `${dd}-${mm}-${yy}`
}

const resetNota = () => {
  nuevaNota.value = {
    titulo: '',
    contenido: '',
    prioridad: 'MEDIA',
    tipo: 'GENERAL',
  }
}

const resetItem = () => {
  nuevoItem.value = {
    nombre: '',
    descripcion: '',
    categoria: 'OTRO',
    fecha_hallazgo: '',
    ubicacion: '',
  }
}

const nuevaNota = ref({
  titulo: '',
  contenido: '',
  prioridad: 'MEDIA',
  tipo: 'GENERAL',
})

const nuevoItem = ref({
  nombre: '',
  descripcion: '',
  categoria: 'OTRO',
  fecha_hallazgo: '',
  ubicacion: '',
})
const crearNota = async () => {
  try {
    await apolloClient.mutate({
      mutation: CREATE_NOTA,
      variables: {
        input: {
          sala_id: Number(opcionSeleccionada.value),
          ...nuevaNota.value,
          created_by: authStore.user?.uid,
        },
      },
    })

    await fetchNotas(Number(opcionSeleccionada.value))

    resetNota()
    mostrarFormNota.value = false

    Swal.fire('Éxito', 'Observación creada correctamente', 'success')
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al crear la observación', 'error')
  }
}
const crearItemPerdido = async () => {
  try {
    await apolloClient.mutate({
      mutation: CREATE_ITEM_PERDIDO,
      variables: {
        input: {
          sala_id: Number(opcionSeleccionada.value),
          ...nuevoItem.value,
          reportado_por: authStore.user?.uid,
        },
      },
    })

    await fetchItems(Number(opcionSeleccionada.value))

    resetItem()
    mostrarFormItem.value = false

    Swal.fire('Éxito', 'Objeto perdido registrado correctamente', 'success')
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al registrar el objeto', 'error')
  }
}
const marcarComoRecuperado = async (itemId: number) => {
  try {
    await apolloClient.mutate({
      mutation: UPDATE_ITEM_PERDIDO,
      variables: {
        id: itemId,
        input: {
          estado: 'RECLAMADO',
        },
      },
    })

    await fetchItems(Number(opcionSeleccionada.value))

    Swal.fire('Éxito', 'Objeto marcado como recuperado', 'success')
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al actualizar el estado', 'error')
  }
}
const marcarNotaComoResuelta = async (notaId: number) => {
  try {
    await apolloClient.mutate({
      mutation: UPDATE_NOTA,
      variables: {
        id: notaId,
        input: {
          resuelta: true,
        },
      },
    })

    await fetchNotas(Number(opcionSeleccionada.value))

    Swal.fire('Éxito', 'Observación marcada como resuelta', 'success')
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Error al resolver la observación', 'error')
  }
}

const fetchSalas = async () => {
  const { data } = await apolloClient.query({ query: GET_SALAS })
  salas.value = data.salas
}
const fetchItems = async (salaId: number) => {
  const { data } = await apolloClient.query({
    query: GET_ITEMS_PERDIDOS_POR_SALA,
    variables: { salaId },
    fetchPolicy: 'network-only',
  })
  itemsPerdidos.value = data.itemsPerdidosPorSala
  console.log(itemsPerdidos.value)
}

const fetchNotas = async (salaId: number) => {
  const { data } = await apolloClient.query({
    query: GET_NOTAS_POR_SALA,
    variables: { salaId },
    fetchPolicy: 'network-only',
  })
  notas.value = data.notasPorSala
}

watch(opcionSeleccionada, (val) => {
  if (val) {
    fetchItems(Number(val))
    fetchNotas(Number(val))
    mostrarFormItem.value = false
    mostrarFormNota.value = false
  }
})

onMounted(fetchSalas)
</script>

<style scoped>
.page {
  width: 100%;
  padding: 20px 40px;
  box-sizing: border-box;
}

.page-title {
  font-family: 'Cal Sans', sans-serif;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
}

/* CONTROLES */
.controls-bar {
  max-width: 800px;
  margin: 0 auto 25px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* SELECTOR */
.selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-history {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  transition: all 0.2s;
  height: 42px; /* Para alinear con el select */
}

.btn-history:hover {
  background-color: #e5e7eb;
}

.btn-history.active {
  background-color: #374151;
  color: white;
  border-color: #374151;
}

.selector select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #c2bdbd;
  font-family: 'Outfit', sans-serif;
}

/* LAYOUT */
.layout {
  display: grid;
  grid-template-columns: 1fr 2px 1fr;
  height: calc(100vh - 220px);
  width: 100%;
}

/* DIVISOR */
.divider {
  background-color: #d1d5db;
}

/* PANEL */
.panel {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* TITULO */
.panel-title {
  font-family: 'Cal Sans', sans-serif;
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 14px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

/* CARDS */
.cards {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.card h3 {
  margin: 0;
  font-family: 'Cal Sans', sans-serif;
}

.card p {
  margin: 8px 0;
  font-family: 'Outfit', sans-serif;
}

/* TAGS */
.meta-joined {
  display: inline-flex;
  align-items: stretch;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  margin-top: 4px;
}

.cat-part {
  background-color: #f3f4f6;
  color: #374151;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  border-right: 1px solid #e5e7eb;
}

.status-part {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  height: 24px;
}

.estado {
  background: #dbeafe;
}
.priority {
  background: #fee2e2;
}
.resuelta {
  background: #dcfce7;
}

/* FOOTER FIJO */
.sticky-footer {
  position: sticky;
  bottom: 0;
  background: #ffffff;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

/* BOTÓN */
.btn-primary {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background-color: #2d8cff;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: 0.2s;
}

.btn-primary:hover {
  background-color: #1c6fd8;
}

/* FORM */
.form-box {
  margin-top: 12px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-box input,
.form-box textarea,
.form-box select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #c2bdbd;
  font-family: 'Outfit', sans-serif;
}

.form-box textarea {
  resize: none;
  min-height: 90px;
}

/* VACÍO */
.empty {
  text-align: center;
  color: #6b7280;
  font-family: 'Outfit', sans-serif;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: #4b5563;
  margin: 6px 0 10px;
  font-family: 'Outfit', sans-serif;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* BOTÓN RECUPERADO */
.btn-recuperado {
  background-color: #22c55e; /* verde */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
}

.btn-recuperado:hover {
  background-color: #16a34a;
  transform: translateY(-1px);
}

.btn-recuperado:active {
  transform: scale(0.97);
}
.tipo-general {
  background-color: #e5e7eb;
  color: #374151;
}

.tipo-mantenimiento {
  background-color: #fde68a;
  color: #92400e;
}

.tipo-limpieza {
  background-color: #bae6fd;
  color: #075985;
}

.tipo-incidente {
  background-color: #fecaca;
  color: #991b1b;
}

/* PRIORIDADES */
.prioridad-baja {
  background-color: #dcfce7;
  color: #166534;
}

.prioridad-media {
  background-color: #fef3c7;
  color: #92400e;
}

.prioridad-alta {
  background-color: #fee2e2;
  color: #991b1b;
}

/* RESUELTA */
.resuelta {
  background-color: #bbf7d0;
  color: #166534;
}
.btn-resolver {
  background-color: #4f46e5; /* azul */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.btn-resolver:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.btn-resolver:active {
  transform: scale(0.97);
}
</style>
