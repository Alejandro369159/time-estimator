import Swal from 'sweetalert2'

const smallToast = Swal.mixin({
  toast: true,
  position: 'bottom-right',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

export async function showErrorToast(message: string) {
  await smallToast.fire({
    icon: 'error',
    iconColor: 'red',
    title: message,
  })
}
