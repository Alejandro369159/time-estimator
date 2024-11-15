<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '@/services/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import router from '@/router'

// Estado inicial
const isLogin = ref(true)
const loading = ref(false)
const message = ref({ text: '', type: '' })
const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
})

// Cambiar entre login y registro
const toggleAuth = () => {
  isLogin.value = !isLogin.value
  clearForm()
}

// Validar formulario
const validateForm = () => {
  const errors = []

  if (!isLogin.value) {
    if (!formData.value.username || formData.value.username.length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres')
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      errors.push('Las contraseñas no coinciden')
    }
  }
  return errors
}

// Mostrar mensaje
const showMessage = (text: string, type: string) => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 3000)
}

// Enviar formulario
const handleSubmit = async () => {
  const errors = validateForm()
  if (errors.length > 0) {
    showMessage(errors[0], 'error')
    return
  }

  loading.value = true

  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, formData.value.email, formData.value.password)
      router.push('/home')
    } else {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.value.email,
        formData.value.password,
      )
      await updateProfile(userCredential.user, { displayName: formData.value.username })
      showMessage('Registro exitoso. Por favor, inicia sesión con tus credenciales.', 'success')
      toggleAuth()
    }
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error)
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// Obtener mensaje de error de Firebase
const getFirebaseErrorMessage = (error: any) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado'
    case 'auth/invalid-email':
      return 'Correo electrónico inválido'
    case 'auth/operation-not-allowed':
      return 'Operación no permitida'
    case 'auth/weak-password':
      return 'La contraseña es muy débil'
    case 'auth/user-not-found':
      return 'Usuario no encontrado'
    case 'auth/wrong-password':
      return 'Contraseña incorrecta'
    default:
      return 'Ocurrió un error. Por favor, intenta de nuevo.'
  }
}

// Limpiar formulario
const clearForm = () => {
  formData.value = { email: '', password: '', confirmPassword: '', username: '' }
}
</script>

<template>
  <div class="min-h-screen flex items-center bg-gray-100">
    <div class="flex w-3/4 mx-auto md:w-full bg-white shadow-lg">
      <!-- Image section -->
      <div class="flex-1 hidden md:flex">
        <img
          src="@/assets/images/login-left.png"
          alt="Background image"
          class="h-full w-auto object-contain"
        />
      </div>

      <!-- Form section -->
      <div class="flex flex-1 flex-col items-center justify-center p-8">
        <div class="w-full max-w-md">
          <h2
            class="text-3xl font-bold mb-8 text-center"
            v-text="isLogin ? 'Inicia Sesión' : 'Crea una cuenta'"
          ></h2>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Username field for sign up only -->
            <div v-if="!isLogin" class="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                v-model="formData.username"
                required
                autocomplete="username"
                class="w-full px-3 py-1.5 rounded-md bg-gray-200 border border-gray-300 text-base"
              />
            </div>

            <!-- Email field -->
            <div class="form-group">
              <input
                type="email"
                name="email"
                placeholder="Correo"
                v-model="formData.email"
                required
                autocomplete="email"
                class="w-full px-3 py-1.5 rounded-md bg-gray-200 border border-gray-300 text-base outline-none"
              />
            </div>

            <!-- Password field -->
            <div class="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                v-model="formData.password"
                required
                :autocomplete="isLogin ? 'current-password' : 'new-password'"
                class="w-full px-3 py-1.5 rounded-md bg-gray-200 border border-gray-300 text-base outline-none"
              />
            </div>

            <!-- Confirm Password field for sign up only -->
            <div v-if="!isLogin" class="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                v-model="formData.confirmPassword"
                required
                autocomplete="new-password"
                class="w-full px-3 py-1.5 rounded-md bg-gray-200 border border-gray-300 text-base"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full px-3 py-2 rounded-md bg-purple-700 text-white text-lg hover:bg-indigo-800 transition"
              v-text="isLogin ? 'Entrar' : 'Crear cuenta'"
            ></button>
          </form>

          <p
            class="text-center text-lg mt-6 cursor-pointer underline"
            @click="toggleAuth"
            v-text="isLogin ? 'No tengo una cuenta' : 'Ya tengo una cuenta'"
          ></p>

          <!-- Message -->
          <div
            v-if="message.text"
            :class="['message', message.type === 'error' ? 'error' : 'success', 'mt-4']"
          >
            {{ message.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-size: 14px;
}

.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
</style>
