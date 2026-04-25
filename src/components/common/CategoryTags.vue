<template>
  <div class="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
    <h3 class="text-xs font-bold uppercase tracking-widest text-blue-800 mb-4">文章分类</h3>
    <div v-if="loading" class="text-xs text-slate-400">加载中...</div>
    <div v-else-if="categories.length === 0" class="text-xs text-slate-400">暂无分类</div>
    <div v-else class="flex flex-wrap gap-2">
      <span
        v-for="cat in categories"
        :key="cat.id"
        class="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
        :class="activeId === cat.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
        @click="$emit('select', cat.id)"
      >
        {{ cat.title }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategoryList } from '@/api/article'

defineProps({ activeId: { type: Number, default: null } })
defineEmits(['select'])

const categories = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getCategoryList({ type: 'other', page: 1, limit: 50 })
    categories.value = res.data?.list || []
  } catch { /* ignore */ }
  loading.value = false
})
</script>
