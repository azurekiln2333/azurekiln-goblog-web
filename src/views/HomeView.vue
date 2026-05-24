<template>
  <main class="pt-24 max-w-7xl mx-auto px-6">
    <HeroBanner :banner="heroBanner" />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div class="lg:col-span-8 space-y-16">
        <div v-if="loading" class="text-center py-20 text-slate-400">
          <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          <p class="mt-4">加载中...</p>
        </div>
        <div v-else-if="errorMsg" class="rounded-lg bg-red-50 px-4 py-6 text-center text-sm font-semibold text-red-700">
          {{ errorMsg }}
        </div>
        <div v-else-if="articles.length === 0" class="text-center py-20 text-slate-400">
          <span class="material-symbols-outlined text-4xl">article</span>
          <p class="mt-4">暂无文章</p>
        </div>
        <template v-else>
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        </template>

        <div v-if="total > limit" class="flex justify-center gap-2 pt-8">
          <button
            v-for="p in totalPages"
            :key="p"
            class="w-10 h-10 rounded-lg text-sm font-semibold transition-colors"
            :class="p === page ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-blue-50 border border-blue-100'"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <aside class="lg:col-span-4 space-y-10">
        <SearchBox />
        <CategoryTags :activeId="selectedCategory" @select="handleCategorySelect" />
        <AIChatWidget />
        <FriendLinks />
      </aside>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleList } from '@/api/article'
import { getBannerList } from '@/api/banner'
import HeroBanner from '@/components/home/HeroBanner.vue'
import ArticleCard from '@/components/home/ArticleCard.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import CategoryTags from '@/components/common/CategoryTags.vue'
import AIChatWidget from '@/components/common/AIChatWidget.vue'
import FriendLinks from '@/components/common/FriendLinks.vue'

const route = useRoute()
const articles = ref([])
const loading = ref(true)
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const selectedCategory = ref(null)
const heroBanner = ref(null)
const errorMsg = ref('')

const totalPages = computed(() => Math.ceil(total.value / limit.value))

async function fetchArticles() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = {
      type: 'other',
      page: page.value,
      limit: limit.value
    }
    if (selectedCategory.value) {
      params.categoryID = selectedCategory.value
    }
    const res = await getArticleList(params)
    articles.value = res.data?.list || []
    total.value = res.data?.count || 0
  } catch (e) {
    errorMsg.value = e.message || '文章列表加载失败'
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function fetchBanner() {
  try {
    const res = await getBannerList()
    const banners = res.data?.list || []
    if (banners.length > 0) {
      heroBanner.value = banners[0]
    }
  } catch {
    heroBanner.value = null
  }
}

function goToPage(p) {
  page.value = p
  fetchArticles()
}

function handleCategorySelect(catId) {
  selectedCategory.value = selectedCategory.value === catId ? null : catId
  page.value = 1
  fetchArticles()
}

watch(() => route.query, () => {
  if (route.query.categoryID) {
    selectedCategory.value = Number(route.query.categoryID)
  }
  fetchArticles()
})

onMounted(() => {
  fetchBanner()
  fetchArticles()
})
</script>
