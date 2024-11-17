<script setup lang="ts">
import LoadingLabel from '@/components/LoadingLabel.vue'
import type { HistoryRegistry } from '@/entities/HistoryRegistry'
import type { Member } from '@/entities/Member'
import { showErrorToast } from '@/helpers/swalFunctions'
import { historyRegistriesRepository, membersRepository } from '@/repositories'
import router from '@/router'
import { useUserStore } from '@/stores/useUserStore'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'

const userStore = useUserStore()

const pageIndex = ref(0)
const PAGE_SIZE = 10

const members = ref<Member[]>([])
const registries = ref<HistoryRegistry[]>([])
const membersWithRegistries = ref<Array<Member & { lastTrainingDate: Date | undefined }>>([])

const newMemberName = ref<string>('')

const membersForTable = computed<Array<Member & { lastTrainingDate: Date | undefined }>>(() => {
  const startIndex = pageIndex.value * PAGE_SIZE
  const endIndex = (pageIndex.value + 1) * PAGE_SIZE
  return membersWithRegistries.value.slice(startIndex, endIndex)
})

const isLoading = ref(false)

async function fetchMembersAndRegistries() {
  try {
    isLoading.value = true
    members.value = await membersRepository.getByAuthor(userStore.user!.id)
    registries.value = await historyRegistriesRepository.getByAuthor(userStore.user!.id)
    isLoading.value = false
  } catch {
    isLoading.value = false
    showErrorToast('Hubo un error obteniendo los datos, verifique la conexión a internet')
  }
}

function assignLastTrainingDateToMembers() {
  membersWithRegistries.value = members.value.map((member) => ({
    ...member,
    lastTrainingDate: undefined,
  }))
  membersWithRegistries.value.forEach((member, index) => {
    const lastRegistry = registries.value.find((registry) => registry.memberId === member.id)
    if (lastRegistry) {
      membersWithRegistries.value[index].lastTrainingDate = lastRegistry.createdAt
    }
  })
}

async function addMember() {
  try {
    const newMember = await membersRepository.createMember(newMemberName.value)
    membersWithRegistries.value.push({ ...newMember, lastTrainingDate: undefined })
    newMemberName.value = ''
  } catch {
    showErrorToast('Error al crear el nuevo miembro')
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
  return posibleRowsShown >= membersWithRegistries.value.length
}

function isFirstPage() {
  return pageIndex.value === 0
}

onMounted(async () => {
  await fetchMembersAndRegistries()
  assignLastTrainingDateToMembers()
})
</script>

<template>
  <div class="mb-32">
    <h2 class="font-bold text-2xl mb-4 px-6">Mi equipo</h2>
    <div class="max-w-full mx-auto">
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <form @submit.prevent="addMember" class="flex items-center h-10 justify-end px-6 space-x-3">
          <input
            v-model="newMemberName"
            type="text"
            placeholder="Nuevo miembro"
            class="px-3 py-1.5 outline-none"
          />
          <button
            type="submit"
            class="bg-accent-base hover:bg-accent-hover px-3 py-1.5 text-white text-base"
          >
            Agregar +
          </button>
        </form>
        <table class="w-full border-separate border-spacing-y-3 border-spacing-x-6">
          <thead>
            <tr>
              <th class="w-2/3 bg-white text-left px-6 py-2 whitespace-nowrap">Nombre completo</th>
              <th class="w-1/3 bg-white text-left px-6 py-2 whitespace-nowrap">
                Último entrenamiento
              </th>
            </tr>

            <tr>
              <td colspan="2" class="">
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
            <tr v-else-if="!membersWithRegistries.length">
              <td colspan="2">
                <div>
                  <p class="font-medium bg-white py-2 px-6 w-full shadow-sm text-center">
                    Aun no hay miembros en el equipo.
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-for="member in membersForTable"
              :key="member.id"
              @click="router.push({ name: 'member-detail', params: { id: member.id } })"
              class="bg-white hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-6 py-2 whitespace-nowrap">{{ member.name }}</td>
              <td class="px-6 py-2 whitespace-nowrap">{{ member.lastTrainingDate ?? '---' }}</td>
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
