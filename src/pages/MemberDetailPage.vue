<script setup lang="ts">
import LoadingLabel from '@/components/LoadingLabel.vue'
import type { HistoryRegistry } from '@/entities/HistoryRegistry'
import { showErrorToast } from '@/helpers/swalFunctions'
import { historyRegistriesRepository } from '@/repositories'
import { useUserStore } from '@/stores/useUserStore'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import * as tf from '@tensorflow/tfjs'

const route = useRoute()
const user = useUserStore().user

const pageIndex = ref(0)
const PAGE_SIZE = 10

const memberId = route.params.id as string | undefined
const isLoading = ref(false)
const isEstimating = ref(false) // Estado de carga para la estimación

const estimatedTaskDifficulty = ref(0)
const predictedTime = ref<number | null>(null)

const newRegistryDifficulty = ref(0)
const newRegistryCompletitionTimeInMinutes = ref(0)
const taskRegistries = ref<HistoryRegistry[]>([])

const shownRegistries = computed<HistoryRegistry[]>(() => {
  const startIndex = pageIndex.value * PAGE_SIZE
  const endIndex = (pageIndex.value + 1) * PAGE_SIZE
  return taskRegistries.value.slice(startIndex, endIndex)
})

async function getTaskRegistries() {
  try {
    isLoading.value = true
    if (!memberId) throw Error('El miembro no fue encontrado')
    taskRegistries.value = await historyRegistriesRepository.getByMember(memberId)
    isLoading.value = false
  } catch {
    isLoading.value = false
    showErrorToast('Hubo un error obteniendo los datos, verifique la conexión a internet')
  }
}

// Función para entrenar el modelo de regresión con TensorFlow.js
async function trainModel() {
  const model = tf.sequential()
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }))
  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' })

  const difficulties = taskRegistries.value.map((task) => task.taskDificulty)
  const times = taskRegistries.value.map((task) => task.taskCompletitionTimeInMinutes)

  const xs = tf.tensor2d(difficulties, [difficulties.length, 1])
  const ys = tf.tensor2d(times.map(time => time / 60), [times.length, 1]) // Convertimos a horas

  await model.fit(xs, ys, { epochs: 500 })
  return model
}

// Función para predecir el tiempo de completitud
async function estimateTime() {
  if (taskRegistries.value.length < 2) {
    showErrorToast('No hay suficientes datos históricos para hacer una estimación')
    predictedTime.value = null
    return
  }

  isEstimating.value = true // Activa el estado de carga

  const model = await trainModel()
  const input = tf.tensor2d([estimatedTaskDifficulty.value], [1, 1])
  const output = model.predict(input) as tf.Tensor
  const predictedHours = output.dataSync()[0] // Extraemos el valor predicho en horas
  predictedTime.value = Math.round(predictedHours * 60) // Convertimos de horas a minutos

  isEstimating.value = false // Desactiva el estado de carga
}

// Función para agregar un nuevo registro de tarea
async function addTaskRegistry() {
  try {
    if (!memberId) throw Error('No fue posible agregar el registro')
    const newRegistry: HistoryRegistry = {
      taskDificulty: newRegistryDifficulty.value,
      taskCompletitionTimeInMinutes: newRegistryCompletitionTimeInMinutes.value,
      memberId: memberId,
      authorId: user!.id,
      createdAt: new Date(),
    }
    const reference = await historyRegistriesRepository.addRegistry(newRegistry)
    taskRegistries.value.push({ ...newRegistry, id: reference.id })
  } catch {
    showErrorToast('Hubo un error agregando el nuevo registro')
  }
}

// Función para eliminar un registro de tarea específico
async function deleteTaskRegistry(registryId: string) {
  try {
    await historyRegistriesRepository.deleteRegistry(registryId)
    taskRegistries.value = taskRegistries.value.filter((registry) => registry.id !== registryId)
  } catch {
    showErrorToast('No fue posible eliminar el registro')
  }
}

function goToNextPage() {
  if (isLastPage()) return
  pageIndex.value++
}

function goToPreviousPage() {
  if (isFirstPage()) return
  pageIndex.value--
}

function isLastPage() {
  const posibleRowsShown = (pageIndex.value + 1) * PAGE_SIZE
  return posibleRowsShown >= taskRegistries.value.length
}

function isFirstPage() {
  return pageIndex.value === 0
}

onMounted(() => {
  getTaskRegistries()
})
</script>

<template>
  <div class="mb-32">
    <div>
      <h2 class="font-bold text-2xl mb-4 px-6">Miembro:</h2>
    </div>
    <div class="px-6">
      <div class="bg-white shadow-sm py-3 px-4 border-x border-t border-gray-300">
        <h3 class="text-center font-medium text-lg">Estimación de tiempo</h3>
        <form @submit.prevent="estimateTime" class="flex justify-between mt-3">
          <div class="flex items-center">
            <label for="difficulty" class="py-1 font-medium">Dificultad de la tarea: </label>
            <input
              v-model="estimatedTaskDifficulty"
              id="difficulty"
              type="number"
              class="outline-none ml-2 py-1 px-3 bg-gray-100"
            />
          </div>
          <button type="submit" class="px-8 py-1 bg-accent-base text-white">Estimar</button>
        </form>
      </div>
      <div class="py-2 px-4 bg-white border border-gray-300">
        <p class="w-2/3 mx-auto text-center">
          <span v-if="isEstimating" class="text-gray-500">Cargando...</span>
          <span v-else>
            Tiempo estimado de compleción: 
            <span v-if="predictedTime !== null" class="text-accent-base font-medium">{{ predictedTime }} min</span>
            <span v-else class="text-gray-500">N/A</span>
          </span>
        </p>
      </div>

      <!-- Historial -->
      <div class="overflow-x-auto mt-12 bg-white py-3">
        <h3 class="text-center font-medium text-lg mb-3">Historial del entrenamiento</h3>
        <form
          @submit.prevent="addTaskRegistry"
          class="flex items-center h-10 justify-end px-6 space-x-3"
        >
          <label for="newRegistryDifficulty">Dificultad: </label>
          <input
            id="newRegistryDifficulty"
            v-model="newRegistryDifficulty"
            type="number"
            class="px-2 py-1.5 outline-none w-20 bg-gray-100"
          />
          <label for="newRegistryCompletitionTimeInMinutes">Tiempo de compleción (minutos): </label>
          <input
            id="newRegistryCompletitionTimeInMinutes"
            v-model="newRegistryCompletitionTimeInMinutes"
            type="number"
            class="px-2 py-1.5 outline-none w-20 bg-gray-100"
          />
          <button type="submit" class="bg-accent-base px-3 py-1.5 text-white text-base">
            Agregar registro
          </button>
        </form>
        <table class="w-full border-separate border-spacing-y-3 border-spacing-x-6 mt-3">
          <thead>
            <tr>
              <th class="w-2/3 bg-white text-left px-6 py-2 whitespace-nowrap">
                Fecha de creación
              </th>
              <th class="w-1/3 bg-white text-left px-6 py-2 whitespace-nowrap">
                Dificultad de la tarea
              </th>
              <th class="w-1/3 bg-white text-left px-6 py-2 whitespace-nowrap">
                Tiempo de compleción
              </th>
              <th class="w-1/3 bg-white text-left px-6 py-2 whitespace-nowrap">Acciones</th>
            </tr>
            <tr>
              <td colspan="4">
                <hr class="border-zinc-400" />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="2">
                <LoadingLabel />
              </td>
            </tr>
            <tr v-else-if="!taskRegistries.length">
              <td colspan="4">
                <div>
                  <p class="font-medium bg-white py-2 px-6 w-full shadow-sm text-center">
                    Aún no hay registros de tareas para este miembro.
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-for="registry in shownRegistries"
              :key="registry.id"
              class="bg-white cursor-pointer"
            >
              <td class="px-6 py-2 whitespace-nowrap">
                {{ registry.createdAt.toLocaleDateString() }}
              </td>
              <td class="px-6 py-2 whitespace-nowrap">{{ registry.taskDificulty }}</td>
              <td class="px-6 py-2 whitespace-nowrap">
                {{ registry.taskCompletitionTimeInMinutes }}
              </td>
              <td class="px-6 py-2 whitespace-nowrap">
                <button
                  @click="deleteTaskRegistry(registry.id!)"
                  type="button"
                  class="bg-gray-100 text-black hover:bg-red-500 hover:text-white px-3 py-1"
                >
                  Borrar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Navegación -->
      <div class="flex justify-between items-center mt-4 mx-6">
        <button
          @click="goToPreviousPage"
          class="flex items-center justify-center p-2 rounded-lg w-10 h-10 bg-secondary"
          :class="{ '!bg-gray-200 cursor-default': isFirstPage() }"
        >
          <ChevronLeftIcon class="text-white" />
        </button>
        <p
          class="bg-white flex items-center justify-center p-2 rounded-lg bg-customPurpleVector w-12 h-10"
        >
          {{ pageIndex + 1 }}
        </p>
        <button
          @click="goToNextPage"
          class="flex items-center justify-center p-2 rounded-lg w-10 h-10 bg-secondary"
          :class="{ '!bg-gray-200 cursor-default': isLastPage() }"
        >
          <ChevronRightIcon class="text-white" />
        </button>
      </div>
    </div>
  </div>
</template>