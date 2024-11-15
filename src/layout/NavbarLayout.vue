<script setup lang="ts">
import router from '@/router'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()
</script>

<template>
  <div>
    <nav class="bg-white shadow-lg mb-10">
      <div class="max-w-full px-6">
        <div class="flex justify-between h-16">
          <div class="flex cursor-pointer" @click="router.push({ name: 'my-team' })">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <img class="h-12 w-12" src="@/assets/images/logo.png" alt="Logo" />
            </div>
            <h1 class="flex-shrink-0 flex items-center pl-4 text-xl font-bold">
              Time <span class="ml-1 text-primary">estimator</span>
            </h1>
          </div>
          <!-- Botón Log in -->
          <div class="flex items-center">
            <a
              @click="userStore.logOut()"
              class="text-gray-600 text-md font-medium hover:text-zinc-500 hover:cursor-pointer"
            >
              Cerrar sesión
            </a>
          </div>
        </div>
      </div>
    </nav>
    <main class="px-12">
      <RouterView />
    </main>
  </div>
</template>
