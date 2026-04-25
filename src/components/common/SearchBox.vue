<template>
  <div class="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
    <h3 class="text-xs font-bold uppercase tracking-widest text-blue-800 mb-4">探索发现</h3>
    <div class="relative">
      <input
        v-model="searchKey"
        class="w-full bg-white border border-blue-100 outline-none focus:ring-2 focus:ring-blue-600/20 px-4 py-3 rounded-md text-sm placeholder:text-slate-400 shadow-sm"
        placeholder="搜索文章..."
        type="text"
        @keyup.enter="handleSearch"
      />
      <button class="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600" @click="handleSearch">
        <span class="material-symbols-outlined">search</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchKey = ref('')

function handleSearch() {
  if (searchKey.value.trim()) {
    router.push({ name: 'Search', query: { key: searchKey.value.trim() } })
  }
}
</script>
