<template>
  <main class="pt-24 max-w-7xl mx-auto px-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="font-headline text-3xl font-extrabold text-on-surface mb-4">搜索文章</h1>
        <div class="relative">
          <input
            v-model="searchKey"
            class="w-full bg-white border border-blue-100 outline-none focus:ring-2 focus:ring-blue-600/20 px-6 py-4 rounded-xl text-lg placeholder:text-slate-400 shadow-sm"
            placeholder="输入关键词搜索..."
            type="text"
            @keyup.enter="handleSearch"
          />
          <button class="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600" @click="handleSearch">
            <span class="material-symbols-outlined text-2xl">search</span>
          </button>
        </div>
      </div>

      <div v-if="tagList.length > 0" class="mb-8 flex flex-wrap gap-2">
        <span
          v-for="tag in tagList"
          :key="tag"
          class="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
          :class="selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </span>
      </div>

      <div v-if="loading" class="text-center py-20 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
      <div v-else-if="searched" class="space-y-8">
        <p class="text-sm text-slate-500">找到 {{ total }} 篇相关文章</p>
        <div v-for="article in articles" :key="article.id" class="p-6 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer" @click="$router.push(`/article/${article.id}`)">
          <h2 class="text-xl font-bold font-headline text-slate-900 hover:text-blue-600 transition-colors mb-2" v-html="article.highlightTitle || article.title"></h2>
          <p class="text-sm text-slate-600 line-clamp-2 mb-3" v-html="article.highlightAbstract || article.abstract"></p>
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <span v-if="article.authorNickName">{{ article.authorNickName }}</span>
            <span>{{ formatDate(article.createdAt) }}</span>
            <span v-if="article.categoryTitle" class="text-blue-600">{{ article.categoryTitle }}</span>
          </div>
        </div>
        <div v-if="articles.length === 0" class="text-center py-12 text-slate-400">
          未找到相关文章
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { searchArticle } from '@/api/article'

const route = useRoute()
const searchKey = ref('')
const articles = ref([])
const total = ref(0)
const loading = ref(false)
const searched = ref(false)
const tagList = ref([])
const selectedTag = ref('')

async function handleSearch() {
  if (!searchKey.value.trim() && !selectedTag.value) return
  loading.value = true
  searched.value = true
  try {
    const params = { page: 1, limit: 20 }
    if (searchKey.value.trim()) params.key = searchKey.value.trim()
    if (selectedTag.value) params.tag = selectedTag.value
    const res = await searchArticle(params)
    articles.value = res.data?.list || []
    total.value = res.data?.count || 0
  } catch { /* ignore */ }
  loading.value = false
}

function toggleTag(tag) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  handleSearch()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

onMounted(() => {
  if (route.query.key) {
    searchKey.value = route.query.key
    handleSearch()
  }
})
</script>
