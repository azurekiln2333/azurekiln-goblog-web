<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">文章管理</h2>
      <div class="flex gap-3">
        <select v-model="listMode" class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm" @change="switchMode">
          <option value="all">全部文章</option>
          <option value="review">审核队列</option>
        </select>
        <select v-model="statusFilter" class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm" :disabled="listMode === 'review'" @change="fetchArticles">
          <option value="">全部状态</option>
          <option value="0">草稿</option>
          <option value="1">审核中</option>
          <option value="2">已发布</option>
          <option value="3">已下线</option>
        </select>
      </div>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">标题</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">作者</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">状态</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">置顶</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">浏览</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-12 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载文章中</p>
            </td>
          </tr>
          <tr v-for="article in articles" :key="article.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ article.title }}</td>
            <td class="px-6 py-4 text-slate-500">{{ article.authorNickName || article.userNickName || '-' }}</td>
            <td class="px-6 py-4">
              <span class="text-[10px] font-bold px-2 py-1 rounded-full" :class="statusClass(article.status)">{{ statusText(article.status) }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span v-if="article.userTop" class="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">用户置顶</span>
                <span v-if="article.adminTop" class="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-700">管理员置顶</span>
                <span v-if="!article.userTop && !article.adminTop" class="text-[10px] text-slate-400">未置顶</span>
              </div>
            </td>
            <td class="px-6 py-4 text-slate-500">{{ article.viewCount || article.lookCount || 0 }}</td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-2">
                <button
                  v-if="canReview(article)"
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 hover:underline disabled:opacity-50"
                  :disabled="actionKey === `review-${article.id}`"
                  @click="reviewArticle(article.id, 2)"
                >
                  <span v-if="actionKey === `review-${article.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  通过
                </button>
                <button
                  v-if="canReview(article)"
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50"
                  :disabled="actionKey === `reject-${article.id}`"
                  @click="reviewArticle(article.id, 0)"
                >
                  <span v-if="actionKey === `reject-${article.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  拒绝
                </button>
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                  :disabled="actionKey === `top-${article.id}`"
                  @click="setTop(article)"
                >
                  <span v-if="actionKey === `top-${article.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  置顶
                </button>
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline disabled:opacity-50"
                  :disabled="actionKey === `cancel-top-${article.id}`"
                  @click="cancelMyTop(article)"
                >
                  <span v-if="actionKey === `cancel-top-${article.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  取消我的置顶
                </button>
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline disabled:opacity-50"
                  :disabled="actionKey === `admin-cancel-top-${article.id}`"
                  @click="cancelAuthorTop(article)"
                >
                  <span v-if="actionKey === `admin-cancel-top-${article.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  强制取消置顶
                </button>
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50"
                  :disabled="actionKey === `delete-${article.id}`"
                  @click="deleteArticleById(article.id)"
                >
                  <span v-if="actionKey === `delete-${article.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && articles.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-sm text-slate-400">暂无文章</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > limit" class="flex justify-center gap-2 pt-8">
      <button
        v-for="p in totalPages"
        :key="p"
        class="w-10 h-10 rounded-lg text-sm font-semibold transition-colors"
        :class="p === page ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-blue-50 border border-blue-100'"
        @click="page = p; fetchArticles()"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getArticleList,
  adminDeleteArticle,
  topArticle,
  cancelTopArticle,
  adminCancelTop,
  getReviewList,
  reviewArticle as reviewArticleApi
} from '@/api/article'

const articles = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const statusFilter = ref('')
const listMode = ref('all')
const loading = ref(false)
const errorMsg = ref('')
const actionKey = ref('')

const totalPages = computed(() => Math.ceil(total.value / limit.value))

async function fetchArticles() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = { page: page.value, limit: limit.value }
    let res
    if (listMode.value === 'review') {
      res = await getReviewList(params)
    } else {
      params.type = 'admin'
      if (statusFilter.value) params.status = Number(statusFilter.value)
      res = await getArticleList(params)
    }
    articles.value = res.data?.list || []
    total.value = res.data?.count || 0
  } catch (e) {
    errorMsg.value = e.message || '文章列表加载失败'
  } finally {
    loading.value = false
  }
}

function switchMode() {
  page.value = 1
  fetchArticles()
}

async function reviewArticle(id, status) {
  actionKey.value = `${status === 2 ? 'review' : 'reject'}-${id}`
  errorMsg.value = ''
  try {
    await reviewArticleApi(id, { articleID: id, status })
    await fetchArticles()
  } catch (e) {
    errorMsg.value = e.message || '文章审核失败'
  } finally {
    actionKey.value = ''
  }
}

async function setTop(article) {
  actionKey.value = `top-${article.id}`
  errorMsg.value = ''
  try {
    await topArticle(article.id, { articleID: article.id, topType: 'admin' })
    await fetchArticles()
  } catch (e) {
    errorMsg.value = e.message || '文章置顶失败'
  } finally {
    actionKey.value = ''
  }
}

async function cancelMyTop(article) {
  actionKey.value = `cancel-top-${article.id}`
  errorMsg.value = ''
  try {
    await cancelTopArticle({ articleID: article.id, topType: 'admin' })
    await fetchArticles()
  } catch (e) {
    errorMsg.value = e.message || '取消置顶失败'
  } finally {
    actionKey.value = ''
  }
}

async function cancelAuthorTop(article) {
  actionKey.value = `admin-cancel-top-${article.id}`
  errorMsg.value = ''
  try {
    await adminCancelTop({ userID: article.userID, articleID: article.id })
    await fetchArticles()
  } catch (e) {
    errorMsg.value = e.message || '强制取消置顶失败'
  } finally {
    actionKey.value = ''
  }
}

async function deleteArticleById(id) {
  if (!confirm('确认删除？')) return
  actionKey.value = `delete-${id}`
  errorMsg.value = ''
  try {
    await adminDeleteArticle({ IDList: [id] })
    await fetchArticles()
  } catch (e) {
    errorMsg.value = e.message || '文章删除失败'
  } finally {
    actionKey.value = ''
  }
}

function statusText(status) {
  const map = { 0: '草稿', 1: '审核中', 2: '已发布', 3: '已下线' }
  return map[status] || '未知'
}

function statusClass(status) {
  const map = { 0: 'bg-slate-100 text-slate-600', 1: 'bg-yellow-50 text-yellow-700', 2: 'bg-green-50 text-green-700', 3: 'bg-red-50 text-red-700' }
  return map[status] || 'bg-slate-100 text-slate-600'
}

function canReview(article) {
  return listMode.value === 'review' || article.status === 1
}

onMounted(fetchArticles)
</script>
