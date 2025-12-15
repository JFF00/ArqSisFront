<template>
  <div class="solicitudes-container">
    <h1 class="title">Crear Sala</h1>

    <div class="form-wrapper">
      <form @submit.prevent="crearSala" class="form-sala">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" required />
        </div>

        <div class="form-group">
          <label>Capacidad</label>
          <input v-model.number="form.capacidad" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Ubicación</label>
          <input v-model="form.ubicacion" type="text" required />
        </div>

        <div class="form-group">
          <label>Tipo</label>
          <select v-model="form.tipo" required>
            <option disabled value="">Seleccione un tipo</option>
            <option value="LABORATORIO">Laboratorio</option>
            <option value="AULA">Aula</option>
            <option value="AUDITORIO">Auditorio</option>
          </select>
        </div>
        <div class="form-group">
          <h3>Equipamiento</h3>

          <div v-for="(eq, index) in form.equipamientos" :key="index" class="equipamiento-box">
            <input v-model="eq.nombre" placeholder="Nombre" required />

            <select v-model="eq.tipo" required>
              <option disabled value="">Tipo</option>
              <option value="proyector">Proyector</option>
              <option value="pizarra">Pizarra</option>
              <option value="computadora">Computadora</option>
              <option value="audio">Audio</option>
            </select>

            <input
              type="number"
              min="1"
              v-model.number="eq.cantidad"
              placeholder="Cantidad"
              required
            />

            <button type="button" @click="removeEquipamiento(index)">X</button>
          </div>

          <button type="button" @click="addEquipamiento"> Agregar equipamiento</button>
        </div>

        <button type="submit" class="btn aceptar" :disabled="loading">
          {{ loading ? 'Creando...' : 'Crear Sala' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { CREATE_SALA } from '@/graphql/salas/mutationSalas.ts'
import { CREATE_EQUIPAMIENTO } from '@/graphql/equipamiento/mutationEquipamiento.ts'
import Swal from 'sweetalert2'

const loading = ref(false)

const form = reactive({
  nombre: '',
  capacidad: 0,
  ubicacion: '',
  tipo: '',
  equipamientos: [
    {
      nombre: '',
      tipo: '',
      cantidad: 1,
      estado: 'DISPONIBLE',
      descripcion: '',
    },
  ],
})

const { mutate: createRoom } = useMutation(CREATE_SALA)
const { mutate: createEquipamiento } = useMutation(CREATE_EQUIPAMIENTO)

async function crearSala() {
  try {
    loading.value = true

    // Verifica que se están pasando los datos correctamente
    const salaResult = await createRoom({
      input: {
        nombre: form.nombre,
        capacidad: form.capacidad,
        ubicacion: form.ubicacion,
        tipo: form.tipo,
      },
    })

    if (!salaResult?.data) throw new Error('No se pudo crear la sala')

    const salaId = salaResult.data.createSala.id

    // 2️⃣ Crear equipamientos
    for (const eq of form.equipamientos) {
      await createEquipamiento({
        input: {
          sala_id: Number(salaId),
          nombre: eq.nombre,
          tipo: eq.tipo,
          cantidad: eq.cantidad,
          estado: eq.estado,
          descripcion: eq.descripcion || null,
        },
      })
    }

    Swal.fire('Éxito', 'Sala y equipamiento creados correctamente ✅', 'success')

    // Reset
    form.nombre = ''
    form.capacidad = 0
    form.ubicacion = ''
    form.tipo = ''
    form.equipamientos = []
  } catch (err) {
    console.error(err)
    Swal.fire('Error', 'Error al crear sala y equipamiento', 'error')
  } finally {
    loading.value = false
  }
}
function addEquipamiento() {
  form.equipamientos.push({
    nombre: '',
    tipo: '',
    cantidad: 1,
    estado: 'DISPONIBLE',
    descripcion: '',
  })
}

function removeEquipamiento(index: number) {
  form.equipamientos.splice(index, 1)
}
</script>

<style scoped>
/* Reutiliza tu layout */
/* Layout general */
.solicitudes-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background-color: #f6f7fb;
}

/* Título */
.title {
  font-family: 'Cal Sans', sans-serif;
  font-size: 2.2rem;
  font-weight: bold;
  color: #1f2937;
}

/* Card del formulario */
.form-wrapper {
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* Formulario */
.form-sala {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Grupos */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group h3 {
  margin-bottom: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

/* Labels */
label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #4b5563;
  font-family: 'Outfit', sans-serif;
}

/* Inputs y selects */
input,
select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  transition:
    border 0.2s,
    box-shadow 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* Equipamiento */
.equipamiento-box {
  display: grid;
  grid-template-columns: 1fr 1fr 100px auto;
  gap: 10px;
  align-items: center;
  background: #f9fafb;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

/* Botón eliminar equipamiento */
.equipamiento-box button {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ef4444;
  transition: transform 0.15s;
}

.equipamiento-box button:hover {
  transform: scale(1.15);
}

/* Botón agregar equipamiento */
.form-group > button[type='button'] {
  align-self: flex-start;
  margin-top: 6px;
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.form-group > button[type='button']:hover {
  background-color: #c7d2fe;
}

/* Botón principal */
.btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition:
    background 0.2s,
    transform 0.1s;
}

.aceptar {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
}

.aceptar:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 600px) {
  .equipamiento-box {
    grid-template-columns: 1fr;
  }
}
</style>
