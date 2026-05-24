<template>
  <main class="pt-24 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-12 gap-12">
    <aside class="hidden lg:flex col-span-1 flex-col items-center gap-6 pt-12 sticky top-24 h-fit">
      <div class="flex flex-col items-center gap-2 group">
        <button
          class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-blue-100 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          :class="{ 'bg-primary text-white': isDigged }"
          :disabled="diggLoading"
          @click="handleDigg"
        >
          <span class="material-symbols-outlined" :class="{ 'animate-spin': diggLoading }">{{ diggLoading ? 'progress_activity' : 'thumb_up' }}</span>
        </button>
        <span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{{ article.diggCount || 0 }}</span>
      </div>
      <div class="flex flex-col items-center gap-2 group">
        <button
          class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-blue-100 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          :class="{ 'bg-primary text-white': isCollected }"
          :disabled="collectLoading"
          @click="handleCollect"
        >
          <span class="material-symbols-outlined" :class="{ 'animate-spin': collectLoading }">{{ collectLoading ? 'progress_activity' : 'bookmark' }}</span>
        </button>
        <span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{{ article.collectCount || 0 }}</span>
      </div>
      <div class="flex flex-col items-center gap-2 group">
        <button class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-blue-100 shadow-sm" @click="handleShare">
          <span class="material-symbols-outlined">{{ shareCopied ? 'check' : 'share' }}</span>
        </button>
      </div>
    </aside>

    <article class="col-span-12 lg:col-span-8">
      <div v-if="loading" class="text-center py-20 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
      <template v-else-if="article.id">
        <div v-if="errorMsg" class="mb-8 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {{ errorMsg }}
        </div>
        <header class="mb-12">
          <div class="flex gap-2 mb-6">
            <span v-if="article.categoryTitle" class="px-3 py-1 rounded-full bg-primary text-white font-label text-[10px] uppercase tracking-widest font-bold">{{ article.categoryTitle }}</span>
            <span class="px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 font-label text-[10px] uppercase tracking-widest font-bold">{{ article.viewCount || 0 }} 浏览</span>
          </div>
          <h1 class="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-8">
            {{ article.title }}
          </h1>
          <div class="flex items-center gap-4 py-6 border-y border-blue-100">
            <img
              v-if="article.authorAvatar"
              :src="article.authorAvatar"
              alt="作者头像"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div v-else class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-sm font-bold text-blue-600">{{ (article.authorNickName || '?')[0] }}</span>
            </div>
            <div class="flex-1">
              <p class="font-headline font-bold text-on-surface">{{ article.authorNickName || '匿名' }}</p>
              <p class="text-xs text-on-surface-variant font-label tracking-tight">发布于 {{ formatDate(article.createdAt) }}</p>
            </div>
          </div>
        </header>

        <section class="markdown-body" v-html="renderedContent"></section>

        <div class="flex md:hidden justify-around py-6 border-t border-blue-100 mt-12">
          <button class="flex items-center gap-2 disabled:opacity-60" :class="isDigged ? 'text-primary' : 'text-slate-400'" :disabled="diggLoading" @click="handleDigg">
            <span class="material-symbols-outlined" :class="{ 'animate-spin': diggLoading }">{{ diggLoading ? 'progress_activity' : 'thumb_up' }}</span>
            <span class="text-xs font-bold">{{ article.diggCount || 0 }}</span>
          </button>
          <button class="flex items-center gap-2 disabled:opacity-60" :class="isCollected ? 'text-primary' : 'text-slate-400'" :disabled="collectLoading" @click="handleCollect">
            <span class="material-symbols-outlined" :class="{ 'animate-spin': collectLoading }">{{ collectLoading ? 'progress_activity' : 'bookmark' }}</span>
            <span class="text-xs font-bold">收藏</span>
          </button>
        </div>

        <section class="mt-20 pt-12 border-t border-blue-100">
          <h3 class="font-headline text-2xl font-bold text-on-surface mb-8">评论 ({{ commentCount }})</h3>

          <div class="bg-white p-6 rounded-xl border border-blue-100 mb-12 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold text-blue-600">我</span>
              </div>
              <div class="flex-1">
                <textarea
                  v-model="commentText"
                  class="w-full bg-transparent border-none focus:ring-0 text-on-surface-variant placeholder:text-slate-400 font-body resize-none"
                  placeholder="加入讨论..."
                  rows="3"
                ></textarea>
                <div class="flex justify-end mt-4 pt-4 border-t border-blue-50">
                  <button
                    class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-md font-bold text-sm hover:bg-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="commentPosting"
                    @click="postNewComment"
                  >
                    <span v-if="commentPosting" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    {{ commentPosting ? '发布中...' : '发布评论' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-8">
            <CommentItem
              v-for="comment in comments"
              :key="comment.id"
              :comment="comment"
              :article-author-id="article.userID"
              :pending-action-id="commentActionId"
              @reply="handleReply"
              @digg="handleCommentDigg"
            />
          </div>

          <div v-if="comments.length === 0" class="text-center py-12 text-slate-400 text-sm">
            暂无评论，来抢沙发吧！
          </div>
        </section>
      </template>
      <div v-else class="text-center py-20 text-slate-400">
        <span class="material-symbols-outlined text-4xl">error</span>
        <p class="mt-4">文章不存在或已被删除</p>
      </div>
    </article>

    <aside class="hidden lg:block lg:col-span-3 pt-12 sticky top-24 h-fit">
      <div class="p-6 bg-white border border-blue-100 rounded-xl shadow-sm">
        <h4 class="font-headline font-bold text-xs uppercase tracking-widest text-primary mb-6">目录</h4>
        <nav class="space-y-4">
          <a
            v-for="(heading, i) in headings"
            :key="i"
            :href="'#' + heading.id"
            class="block text-sm transition-all"
            :class="i === 0 ? 'text-primary font-bold border-l-2 border-primary pl-4 -ml-6' : 'text-on-surface-variant hover:text-primary pl-4'"
          >
            {{ heading.text }}
          </a>
        </nav>
      </div>
    </aside>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import { getArticleDetail, diggArticle, collectArticle, recordArticleView } from '@/api/article'
import { getCommentList, postComment, diggComment } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import CommentItem from '@/components/article/CommentItem.vue'

const route = useRoute()
const userStore = useUserStore()
const uiStore = useUiStore()

const article = ref({})
const loading = ref(true)
const comments = ref([])
const commentCount = ref(0)
const commentText = ref('')
const isDigged = ref(false)
const isCollected = ref(false)
const headings = ref([])
const errorMsg = ref('')
const diggLoading = ref(false)
const collectLoading = ref(false)
const commentPosting = ref(false)
const commentActionId = ref(null)
const shareCopied = ref(false)

const renderedContent = computed(() => {
  if (!article.value.content) return ''
  return marked(article.value.content)
})

function extractHeadings(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  const h2s = div.querySelectorAll('h2')
  headings.value = Array.from(h2s).map((h, i) => {
    const id = 'heading-' + i
    h.id = id
    return { id, text: h.textContent }
  })
  return div.innerHTML
}

async function fetchArticle() {
  loading.value = true
  errorMsg.value = ''
  try {
    const id = route.params.id
    const res = await getArticleDetail(id)
    article.value = res.data || {}
    if (article.value.content) {
      article.value.content = extractHeadings(marked(article.value.content))
    }
    if (userStore.isLoggedIn) {
      recordArticleView({ articleID: Number(id), timeSecond: 0 }, { showLoading: false })
    }
  } catch (e) {
    errorMsg.value = e.message || '文章加载失败'
    article.value = {}
  } finally {
    loading.value = false
  }
}

async function fetchComments() {
  errorMsg.value = ''
  try {
    const res = await getCommentList({ articleID: route.params.id, page: 1, limit: 50 })
    comments.value = res.data?.list || []
    commentCount.value = res.data?.count || 0
  } catch (e) {
    errorMsg.value = e.message || '评论加载失败'
  }
}

async function handleDigg() {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再点赞', 'warning')
    return
  }
  if (diggLoading.value) return
  diggLoading.value = true
  errorMsg.value = ''
  try {
    await diggArticle(route.params.id)
    isDigged.value = !isDigged.value
    article.value.diggCount = (article.value.diggCount || 0) + (isDigged.value ? 1 : -1)
  } catch (e) {
    errorMsg.value = e.message || '点赞失败'
  } finally {
    diggLoading.value = false
  }
}

async function handleCollect() {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再收藏', 'warning')
    return
  }
  if (collectLoading.value) return
  collectLoading.value = true
  errorMsg.value = ''
  try {
    await collectArticle({ articleID: Number(route.params.id), collectID: 0 })
    isCollected.value = !isCollected.value
    article.value.collectCount = (article.value.collectCount || 0) + (isCollected.value ? 1 : -1)
  } catch (e) {
    errorMsg.value = e.message || '收藏失败'
  } finally {
    collectLoading.value = false
  }
}

async function handleShare() {
  try {
    await navigator.clipboard?.writeText(window.location.href)
    shareCopied.value = true
    uiStore.notify('链接已复制', 'success')
    window.setTimeout(() => {
      shareCopied.value = false
    }, 1800)
  } catch {
    uiStore.notify('复制失败，请手动复制地址栏链接', 'error')
  }
}

async function postNewComment() {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再评论', 'warning')
    return
  }
  if (!commentText.value.trim()) {
    uiStore.notify('请先填写评论内容', 'warning')
    return
  }
  if (commentPosting.value) return
  commentPosting.value = true
  errorMsg.value = ''
  try {
    await postComment({
      content: commentText.value.trim(),
      articleID: Number(route.params.id),
      parentID: 0
    })
    commentText.value = ''
    await fetchComments()
  } catch (e) {
    errorMsg.value = e.message || '评论发布失败'
  } finally {
    commentPosting.value = false
  }
}

async function handleReply({ content, parentID, rootID }) {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再回复', 'warning')
    return
  }
  commentActionId.value = parentID
  errorMsg.value = ''
  try {
    await postComment({ content, articleID: Number(route.params.id), parentID, rootID })
    await fetchComments()
  } catch (e) {
    errorMsg.value = e.message || '回复发布失败'
  } finally {
    commentActionId.value = null
  }
}

async function handleCommentDigg(id) {
  if (!userStore.isLoggedIn) {
    uiStore.notify('请先登录后再点赞评论', 'warning')
    return
  }
  commentActionId.value = id
  errorMsg.value = ''
  try {
    await diggComment(id)
    uiStore.notify('评论点赞成功', 'success')
  } catch (e) {
    errorMsg.value = e.message || '评论点赞失败'
  } finally {
    commentActionId.value = null
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

watch(() => route.params.id, () => {
  if (route.params.id) {
    fetchArticle()
    fetchComments()
  }
})

onMounted(() => {
  fetchArticle()
  fetchComments()
})
</script>
