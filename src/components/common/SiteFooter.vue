<template>
  <footer class="w-full py-12 mt-20 bg-slate-50 border-t border-blue-100">
    <div class="flex flex-col items-center gap-4 max-w-7xl mx-auto px-6">
      <div class="text-sm font-bold text-blue-900">{{ siteName }}</div>
      <div class="flex gap-6">
        <a class="text-slate-500 hover:text-blue-700 transition-opacity text-xs font-medium" href="#">隐私政策</a>
        <a class="text-slate-500 hover:text-blue-700 transition-opacity text-xs font-medium" href="#">服务条款</a>
        <a class="text-slate-500 hover:text-blue-700 transition-opacity text-xs font-medium" href="#">RSS 订阅</a>
        <a class="text-slate-500 hover:text-blue-700 transition-opacity text-xs font-medium" href="#">联系我们</a>
      </div>
      <button
        class="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-blue-100 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="heartbeatLoading"
        :title="heartbeatMessage"
        @click="checkHeartbeat"
      >
        <span
          class="h-2 w-2 rounded-full"
          :class="heartbeatClass"
        ></span>
        <span v-if="heartbeatLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
        {{ heartbeatText }}
      </button>
      <div class="text-slate-400 text-[10px] mt-4">
        © {{ new Date().getFullYear() }} {{ siteName }}。专为架构师打造。
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSiteStore } from '@/stores/site'
import { getHeartbeat } from '@/api/heartbeat'

const siteStore = useSiteStore()
const siteName = computed(() => siteStore.getSiteName())
const heartbeatLoading = ref(false)
const heartbeatState = ref('unknown')
const heartbeatMessage = ref('尚未检查服务状态')

const heartbeatText = computed(() => {
  if (heartbeatLoading.value) return '服务检查中'
  if (heartbeatState.value === 'ok') return '服务在线'
  if (heartbeatState.value === 'error') return '服务异常'
  return '检查服务状态'
})

const heartbeatClass = computed(() => {
  if (heartbeatLoading.value) return 'bg-blue-400'
  if (heartbeatState.value === 'ok') return 'bg-green-500'
  if (heartbeatState.value === 'error') return 'bg-red-500'
  return 'bg-slate-300'
})

async function checkHeartbeat() {
  heartbeatLoading.value = true
  heartbeatMessage.value = '正在检查后端服务状态'
  try {
    const res = await getHeartbeat()
    heartbeatState.value = 'ok'
    heartbeatMessage.value = res.message || '后端服务在线'
  } catch (e) {
    heartbeatState.value = 'error'
    heartbeatMessage.value = e.message || '后端服务不可用'
  } finally {
    heartbeatLoading.value = false
  }
}

onMounted(checkHeartbeat)
</script>
