<script setup lang="ts">
import LoadingLabel from '@/components/LoadingLabel.vue'
import type { HistoryRegistry } from '@/entities/HistoryRegistry'
import type { Member } from '@/entities/Member'
import { showErrorToast } from '@/helpers/swalFunctions'
import { historyRegistryRepositories, membersRepository } from '@/repositories'
import router from '@/router'
import { useUserStore } from '@/stores/useUserStore'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'

const userStore = useUserStore()

const members = ref<Member[]>([])
const registries = ref<HistoryRegistry[]>([])

const membersWithRegistries = ref<Array<Member & { lastTrainingDate: Date | undefined }>>([])

const pageIndex = ref(0)
const PAGE_SIZE = 10

const membersForTable = computed<Array<Member & { lastTrainingDate: Date | undefined }>>(() => {
  const startIndex = pageIndex.value * PAGE_SIZE
  const endIndex = (pageIndex.value + 1) * (PAGE_SIZE - 1)
  return membersWithRegistries.value.slice(startIndex, endIndex)
})

const isLoading = ref(false)

async function fetchMembersAndRegistries() {
  try {
    isLoading.value = true
    members.value = await membersRepository.getByAuthor(userStore.user!.id)
    registries.value = await historyRegistryRepositories.getByAuthor(userStore.user!.id)
    isLoading.value = false
  } catch (error) {
    console.log(error)
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

function goToNextPage() {
  const rowsShown = (pageIndex.value + 1) * (PAGE_SIZE - 1)
  const isLastPage = rowsShown >= membersForTable.value.length
  if (isLastPage) return
  pageIndex.value++
}

function goToPreviousPage() {
  if (pageIndex.value === 0) return
  pageIndex.value--
}

onMounted(async () => {
  await fetchMembersAndRegistries()
  assignLastTrainingDateToMembers()
})
</script>

<template>
  <LoadingLabel v-if="isLoading" />
  <div v-else>
    <div class="max-w-full mx-auto px-6 md:px-12 lg:px-24">
      <h2 class="font-bold text-xl mb-4 mx-6">Mi equipo</h2>
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="w-full border-separate border-spacing-y-3 border-spacing-x-6">
          <thead>
            <tr>
              <th class="w-2/3 bg-white text-left px-6 py-3 whitespace-nowrap">Nombre completo</th>
              <th class="w-1/3 bg-white text-left px-6 py-3 whitespace-nowrap">
                Último entrenamiento
              </th>
            </tr>
          </thead>
          <tr>
            <td colspan="2" class="">
              <hr class="border-zinc-400" />
            </td>
          </tr>
          <tbody>
            <tr
              v-for="member in membersForTable"
              :key="member.id"
              @click="router.push({ name: 'member-detail', params: { id: member.id } })"
              class="bg-white hover:bg-gray-100"
            >
              <td class="px-6 py-3 whitespace-nowrap">{{ member.name }}</td>
              <td class="px-6 py-3 whitespace-nowrap">{{ member.lastTrainingDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Navegación -->
      <div class="flex justify-between items-center mt-4 mx-6">
        <button
          @click="goToPreviousPage"
          class="flex items-center justify-center p-2 rounded-lg bg-secondary w-10 h-10"
        >
          <ChevronLeftIcon class="text-white" />
        </button>
        <p
          class="bg-white flex items-center justify-center p-2 rounded-lg bg-customPurpleVector w-12 h-10"
        >
          2
        </p>
        <button
          @click="goToNextPage"
          class="flex items-center justify-center p-2 rounded-lg bg-secondary w-10 h-10"
        >
          <ChevronRightIcon class="text-white" />
        </button>
      </div>
    </div>
  </div>
</template>
