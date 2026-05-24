<template>
  <div class="px-6">
    <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">合作伙伴</h3>
    <div v-if="loading" class="text-xs text-slate-400">加载中...</div>
    <ul v-else class="space-y-3">
      <li v-for="link in links" :key="link.id">
        <a
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="text-sm text-slate-600 hover:text-blue-600 flex items-center justify-between"
        >
          {{ link.name }}
          <span class="material-symbols-outlined text-xs">arrow_outward</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFriendLinks } from '@/api/friend'

const links = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getFriendLinks()
    links.value = res.data?.list || []
  } catch { /* ignore */ }
  loading.value = false
})
</script>
