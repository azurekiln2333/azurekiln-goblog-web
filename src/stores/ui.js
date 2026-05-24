import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

let toastSeed = 0

export const useUiStore = defineStore('ui', () => {
  const pendingCount = ref(0)
  const toasts = ref([])

  const isLoading = computed(() => pendingCount.value > 0)

  function startLoading() {
    pendingCount.value += 1
  }

  function stopLoading() {
    pendingCount.value = Math.max(0, pendingCount.value - 1)
  }

  function notify(message, type = 'info') {
    if (!message) return
    const id = ++toastSeed
    toasts.value.push({ id, message, type })
    window.setTimeout(() => removeToast(id), type === 'error' ? 5200 : 3200)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    pendingCount,
    isLoading,
    toasts,
    startLoading,
    stopLoading,
    notify,
    removeToast
  }
})
