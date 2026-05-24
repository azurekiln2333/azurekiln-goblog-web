<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="uiStore.isLoading" class="fixed inset-x-0 top-0 z-[80] h-1 bg-primary-fixed">
        <div class="h-full w-1/3 animate-loading-bar bg-gradient-to-r from-primary to-primary-container"></div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="uiStore.isLoading"
        class="fixed right-5 top-5 z-[79] flex items-center gap-3 rounded-lg bg-surface-container-lowest/90 px-4 py-3 text-sm font-semibold text-on-surface shadow-[0_10px_30px_rgba(25,28,30,0.08)] backdrop-blur-xl"
        role="status"
        aria-live="polite"
      >
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        <span>请求处理中...</span>
      </div>
    </Transition>

    <div class="fixed right-5 top-20 z-[90] flex w-[min(360px,calc(100vw-40px))] flex-col gap-3">
      <TransitionGroup name="toast">
        <button
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          type="button"
          class="flex items-start gap-3 rounded-lg bg-surface-container-lowest/95 px-4 py-3 text-left text-sm shadow-[0_10px_30px_rgba(25,28,30,0.08)] backdrop-blur-xl transition-colors"
          :class="toastClass(toast.type)"
          @click="uiStore.removeToast(toast.id)"
        >
          <span class="material-symbols-outlined text-base">{{ toastIcon(toast.type) }}</span>
          <span class="leading-relaxed">{{ toast.message }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

function toastIcon(type) {
  const map = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return map[type] || map.info
}

function toastClass(type) {
  const map = {
    success: 'text-emerald-700',
    error: 'text-red-700',
    warning: 'text-amber-700',
    info: 'text-primary'
  }
  return map[type] || map.info
}
</script>
