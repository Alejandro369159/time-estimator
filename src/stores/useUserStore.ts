import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/entities/User'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(getUser())

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      clearUser()
      router.push('/login')
    }
  })

  function getUser(): User | null {
    const localUser = localStorage.getItem('user')
    return localUser ? JSON.parse(localUser) : null
  }

  function setUser(_user: User) {
    user.value = _user
    localStorage.setItem('user', JSON.stringify(_user))
  }

  function clearUser() {
    localStorage.removeItem('user')
    user.value = null
  }

  return {
    user,
    clearUser,
    setUser,
  }
})
