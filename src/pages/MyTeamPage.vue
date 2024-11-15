<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

const registries = ref()
</script>

<template>
  <div class="">
    <div class="max-w-full mx-auto px-6 md:px-12 lg:px-24">
      <h2 class="font-bold text-xl mb-4 mx-6">Mi equipo</h2>
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="w-full border-separate border-spacing-y-3 border-spacing-x-6">
          <thead>
            <tr>
              <th class="w-2/3 bg-white text-left px-6 py-3 whitespace-nowrap">Nombre completo</th>
              <th class="w-1/3 bg-white text-left px-6 py-3 whitespace-nowrap">
                Última entrenamiento
              </th>
            </tr>
          </thead>
          <tr>
            <td colspan="2" class="">
              <hr class="border-zinc-400" />
            </td>
          </tr>
          <tbody>
            <tr class="bg-white hover:bg-gray-100">
              <td class="px-6 py-3 whitespace-nowrap">John Doe</td>
              <td class="px-6 py-3 whitespace-nowrap">10/11/2024</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Navegación -->
      <div class="flex justify-between items-center mt-4 mx-6">
        <button class="flex items-center justify-center p-2 rounded-lg bg-secondary w-10 h-10">
          <ChevronLeftIcon class="text-white" />
        </button>
        <p
          class="bg-white flex items-center justify-center p-2 rounded-lg bg-customPurpleVector w-12 h-10"
        >
          2
        </p>
        <button class="flex items-center justify-center p-2 rounded-lg bg-secondary w-10 h-10">
          <ChevronRightIcon class="text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
