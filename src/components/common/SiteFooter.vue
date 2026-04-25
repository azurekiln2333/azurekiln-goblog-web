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
      <div class="text-slate-400 text-[10px] mt-4">
        © {{ new Date().getFullYear() }} {{ siteName }}。专为架构师打造。
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useSiteStore } from '@/stores/site'

const siteStore = useSiteStore()
const siteName = computed(() => siteStore.getSiteName())
</script>
