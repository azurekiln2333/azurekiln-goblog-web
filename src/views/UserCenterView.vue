<template>
  <main class="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-12 gap-8">
    <aside class="col-span-12 lg:col-span-3 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-slate-100">
        <div class="flex flex-col items-center text-center">
          <div class="relative group">
            <div class="h-24 w-24 rounded-full border-4 border-slate-50 overflow-hidden mb-4 shadow-sm">
              <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" alt="头像" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-blue-100 flex items-center justify-center">
                <span class="text-2xl font-bold text-blue-600">{{ (userStore.userInfo?.nickName || '?')[0] }}</span>
              </div>
            </div>
            <button class="absolute bottom-2 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors">
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 class="text-xl font-bold tracking-tight">{{ userStore.userInfo?.nickName || '用户' }}</h2>
          <p class="text-on-surface-variant text-sm font-medium">{{ userStore.userInfo?.abstract || '暂无简介' }}</p>
        </div>
        <div class="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div class="flex flex-col">
            <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">主要邮箱</span>
            <span class="text-sm font-medium">{{ userStore.userInfo?.email || '未设置' }}</span>
          </div>
          <button
            class="w-full text-left py-2.5 px-4 text-sm font-semibold text-primary bg-blue-light rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            @click="$router.push('/user/messages')"
          >
            <span class="material-symbols-outlined text-lg">mail</span>
            消息中心
          </button>
          <button
            class="w-full text-left py-2.5 px-4 text-sm font-semibold text-primary bg-blue-light rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            @click="$router.push('/user/editor')"
          >
            <span class="material-symbols-outlined text-lg">edit_note</span>
            写文章
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div class="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
          <h3 class="font-bold text-sm">直接消息</h3>
          <span v-if="totalUnread > 0" class="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ totalUnread }} 条新消息</span>
        </div>
        <div class="divide-y divide-slate-50">
          <button
            v-for="session in sessions"
            :key="session.userID"
            class="w-full p-4 flex gap-3 items-center hover:bg-slate-50 transition-colors text-left"
            @click="openChat(session)"
          >
            <div class="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
              <img v-if="session.avatar" :src="session.avatar" :alt="session.nickName" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <p class="text-sm font-bold truncate">{{ session.nickName }}</p>
                <span class="text-[10px] text-on-surface-variant">{{ timeAgo(session.lastMsgTime) }}</span>
              </div>
              <p class="text-xs text-on-surface-variant truncate">{{ session.lastMsg }}</p>
            </div>
          </button>
        </div>
      </div>
    </aside>

    <div class="col-span-12 lg:col-span-6 space-y-6">
      <div class="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-slate-100">
        <div class="flex px-6 pt-4 border-b border-slate-100">
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'collections' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'collections'"
          >
            我的收藏夹
          </button>
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'articles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'articles'"
          >
            我的文章
          </button>
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'history'"
          >
            浏览记录
          </button>
        </div>

        <div class="p-6 flex-1">
          <div v-if="activeTab === 'collections'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="folder in collectFolders"
              :key="folder.id"
              class="p-5 bg-slate-50 rounded-xl hover:bg-blue-light transition-colors cursor-pointer group border border-transparent hover:border-blue-100"
              @click="openFolder(folder)"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="material-symbols-outlined text-primary p-2 bg-white rounded-lg shadow-sm">folder</span>
                <span class="text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">{{ folder.articleCount || 0 }} 篇文章</span>
              </div>
              <h4 class="font-bold text-base mb-1">{{ folder.title }}</h4>
              <p class="text-xs text-on-surface-variant leading-relaxed">{{ folder.abstract || '暂无简介' }}</p>
            </div>
            <div class="p-5 bg-slate-50 rounded-xl hover:bg-blue-light transition-colors cursor-pointer group border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center" @click="showCreateFolder = true">
              <span class="material-symbols-outlined text-slate-400 mb-2">create_new_folder</span>
              <p class="text-xs font-bold text-slate-500">创建新收藏夹</p>
            </div>
          </div>

          <div v-if="activeTab === 'articles'" class="space-y-4">
            <div v-for="art in myArticles" :key="art.id" class="p-4 bg-slate-50 rounded-xl flex items-center gap-4 hover:bg-blue-light transition-colors cursor-pointer" @click="$router.push(`/article/${art.id}`)">
              <div class="flex-1">
                <h4 class="font-bold text-sm mb-1">{{ art.title }}</h4>
                <p class="text-xs text-on-surface-variant">{{ formatDate(art.createdAt) }} · {{ art.viewCount || 0 }} 浏览</p>
              </div>
              <span
                class="text-[10px] font-bold px-2 py-1 rounded-full"
                :class="statusClass(art.status)"
              >{{ statusText(art.status) }}</span>
            </div>
          </div>

          <div v-if="activeTab === 'history'" class="space-y-4">
            <div v-for="h in historyList" :key="h.id" class="p-4 bg-slate-50 rounded-xl flex items-center gap-4 hover:bg-blue-light transition-colors cursor-pointer" @click="$router.push(`/article/${h.articleID}`)">
              <div class="flex-1">
                <h4 class="font-bold text-sm mb-1">{{ h.articleTitle || `文章 #${h.articleID}` }}</h4>
                <p class="text-xs text-on-surface-variant">{{ formatDate(h.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <aside class="col-span-12 lg:col-span-3">
      <AIChatWidget />
    </aside>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'
import { getCollectFolders, getArticleList, getArticleHistory } from '@/api/article'
import { getChatSessions } from '@/api/chat'
import AIChatWidget from '@/components/common/AIChatWidget.vue'

const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

const activeTab = ref('collections')
const collectFolders = ref([])
const myArticles = ref([])
const historyList = ref([])
const sessions = ref([])
const showCreateFolder = ref(false)

const totalUnread = computed(() => messageStore.getTotalUnread())

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchCollectFolders()
  fetchMyArticles()
  fetchHistory()
  fetchSessions()
})

async function fetchCollectFolders() {
  try {
    const res = await getCollectFolders({ id: userStore.userInfo?.id, page: 1, limit: 50 })
    collectFolders.value = res.data?.list || []
  } catch { /* ignore */ }
}

async function fetchMyArticles() {
  try {
    const res = await getArticleList({ type: 'self', page: 1, limit: 50 })
    myArticles.value = res.data?.list || []
  } catch { /* ignore */ }
}

async function fetchHistory() {
  try {
    const res = await getArticleHistory({ type: 'user', page: 1, limit: 50 })
    historyList.value = res.data?.list || []
  } catch { /* ignore */ }
}

async function fetchSessions() {
  try {
    const res = await getChatSessions({ page: 1, limit: 10 })
    sessions.value = res.data?.list || []
  } catch { /* ignore */ }
}

function openFolder(folder) {
  router.push({ name: 'UserCenter', query: { folderId: folder.id } })
}

function openChat(session) {
  router.push({ name: 'Messages', query: { userId: session.userID } })
}

function statusText(status) {
  const map = { 0: '草稿', 1: '审核中', 2: '已发布', 3: '已下线' }
  return map[status] || '未知'
}

function statusClass(status) {
  const map = { 0: 'bg-slate-100 text-slate-600', 1: 'bg-yellow-50 text-yellow-700', 2: 'bg-green-50 text-green-700', 3: 'bg-red-50 text-red-700' }
  return map[status] || 'bg-slate-100 text-slate-600'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  return `${Math.floor(mins / 60)}小时前`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
</script>
