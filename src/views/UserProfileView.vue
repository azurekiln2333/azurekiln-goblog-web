<template>
  <main class="pt-24 pb-12 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-12 gap-8">
      <aside class="col-span-12 lg:col-span-3 space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
          <div v-if="loadingUser" class="py-10 text-slate-400">
            <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载用户中</p>
          </div>
          <template v-else>
          <div class="h-24 w-24 rounded-full border-4 border-slate-50 overflow-hidden mb-4 shadow-sm mx-auto">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.nickName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-blue-100 flex items-center justify-center">
              <span class="text-2xl font-bold text-blue-600">{{ (userInfo.nickName || '?')[0] }}</span>
            </div>
          </div>
          <h2 class="text-xl font-bold tracking-tight">{{ userInfo.nickName || '用户' }}</h2>
          <p class="text-on-surface-variant text-sm font-medium mt-1">{{ userInfo.abstract || '暂无简介' }}</p>
          <div class="flex justify-center gap-6 mt-4 text-xs text-slate-500">
            <span>{{ userInfo.followCount || 0 }} 关注</span>
            <span>{{ userInfo.fansCount || 0 }} 粉丝</span>
          </div>
          <div class="mt-6 flex justify-center gap-3">
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="followLoading || isSelfProfile"
              @click="toggleFollow"
            >
              <span v-if="followLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              {{ isFollowing ? '取消关注' : '关注' }}
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSelfProfile"
              @click="openMessage"
            >
              <span class="material-symbols-outlined text-sm">mail</span>
              私信
            </button>
          </div>
          </template>
        </div>
      </aside>

      <div class="col-span-12 lg:col-span-9">
        <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {{ errorMsg }}
        </div>

        <div class="flex gap-4 mb-8 border-b border-blue-100">
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'articles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'"
            @click="activeTab = 'articles'"
          >
            TA的文章
          </button>
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'collections' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'"
            @click="activeTab = 'collections'"
          >
            TA的收藏
          </button>
        </div>

        <div v-if="activeTab === 'articles'" class="space-y-6">
          <div v-if="loadingArticles" class="py-16 text-center text-slate-400">
            <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载文章中</p>
          </div>
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
          <div v-if="!loadingArticles && articles.length === 0" class="text-center py-12 text-slate-400">暂无文章</div>
        </div>

        <div v-if="activeTab === 'collections'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="loadingFolders" class="col-span-2 py-16 text-center text-slate-400">
            <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载收藏夹中</p>
          </div>
          <div v-for="folder in folders" :key="folder.id" class="p-5 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
            <h4 class="font-bold text-base mb-1">{{ folder.title }}</h4>
            <p class="text-xs text-on-surface-variant">{{ folder.abstract || '暂无简介' }}</p>
          </div>
          <div v-if="!loadingFolders && folders.length === 0" class="col-span-2 text-center py-12 text-slate-400">暂无公开收藏夹</div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserInfo } from '@/api/user'
import { getArticleList, getCollectFolders } from '@/api/article'
import { followUser, unfollowUser, getFollowList } from '@/api/follow'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import ArticleCard from '@/components/home/ArticleCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const uiStore = useUiStore()
const userInfo = ref({})
const articles = ref([])
const folders = ref([])
const activeTab = ref('articles')
const loadingUser = ref(false)
const loadingArticles = ref(false)
const loadingFolders = ref(false)
const errorMsg = ref('')
const followLoading = ref(false)
const isFollowing = ref(false)

const profileUserId = computed(() => Number(route.params.id || 0))
const isSelfProfile = computed(() => userStore.userInfo?.id === profileUserId.value)

async function fetchData() {
  const userId = route.params.id
  if (!userId) return
  errorMsg.value = ''
  loadingUser.value = true
  loadingArticles.value = true
  loadingFolders.value = true
  try {
    const userRes = await getUserInfo(userId)
    userInfo.value = userRes.data || {}
  } catch (e) {
    errorMsg.value = e.message || '用户资料加载失败'
  } finally {
    loadingUser.value = false
  }
  try {
    const artRes = await getArticleList({ type: 'other', userID: userId, page: 1, limit: 20 })
    articles.value = artRes.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '用户文章加载失败'
  } finally {
    loadingArticles.value = false
  }
  try {
    const folderRes = await getCollectFolders({ id: userId, page: 1, limit: 20 })
    folders.value = folderRes.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '用户收藏夹加载失败'
  } finally {
    loadingFolders.value = false
  }
  await fetchFollowState(userId)
}

async function fetchFollowState(userId) {
  if (!userStore.isLoggedIn || isSelfProfile.value) {
    isFollowing.value = false
    return
  }
  try {
    const res = await getFollowList({ page: 1, limit: 200 })
    const list = res.data?.list || []
    isFollowing.value = list.some(item => Number(item.focusUserID) === Number(userId))
  } catch {
    isFollowing.value = false
  }
}

async function toggleFollow() {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再关注用户', 'warning')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  if (isSelfProfile.value || followLoading.value) return
  followLoading.value = true
  errorMsg.value = ''
  try {
    const body = { focusUserID: profileUserId.value }
    if (isFollowing.value) {
      await unfollowUser(body)
      isFollowing.value = false
    } else {
      await followUser(body)
      isFollowing.value = true
    }
  } catch (e) {
    errorMsg.value = e.message || '关注操作失败'
  } finally {
    followLoading.value = false
  }
}

function openMessage() {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再发送私信', 'warning')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  if (isSelfProfile.value) return
  router.push({ name: 'Messages', query: { userId: profileUserId.value } })
}

watch(() => route.params.id, fetchData)
onMounted(fetchData)
</script>
