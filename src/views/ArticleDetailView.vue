<template>
  <main class="pt-24 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-12 gap-12">
    <aside class="hidden lg:flex col-span-1 flex-col items-center gap-6 pt-12 sticky top-24 h-fit">
      <div class="flex flex-col items-center gap-2 group">
        <button
          class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-blue-100 shadow-sm"
          :class="{ 'bg-primary text-white': isDigged }"
          @click="handleDigg"
        >
          <span class="material-symbols-outlined">thumb_up</span>
        </button>
        <span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{{ article.diggCount || 0 }}</span>
      </div>
      <div class="flex flex-col items-center gap-2 group">
        <button
          class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-blue-100 shadow-sm"
          :class="{ 'bg-primary text-white': isCollected }"
          @click="handleCollect"
        >
          <span class="material-symbols-outlined">bookmark</span>
        </button>
        <span class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{{ article.collectCount || 0 }}</span>
      </div>
      <div class="flex flex-col items-center gap-2 group">
        <button class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 border border-blue-100 shadow-sm" @click="handleShare">
          <span class="material-symbols-outlined">share</span>
        </button>
      </div>
    </aside>

    <article class="col-span-12 lg:col-span-8">
      <div v-if="loading" class="text-center py-20 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
      <template v-else-if="article.id">
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
          <button class="flex items-center gap-2" :class="isDigged ? 'text-primary' : 'text-slate-400'" @click="handleDigg">
            <span class="material-symbols-outlined">thumb_up</span>
            <span class="text-xs font-bold">{{ article.diggCount || 0 }}</span>
          </button>
          <button class="flex items-center gap-2" :class="isCollected ? 'text-primary' : 'text-slate-400'" @click="handleCollect">
            <span class="material-symbols-outlined">bookmark</span>
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
                    class="px-6 py-2 bg-primary text-on-primary rounded-md font-bold text-sm hover:bg-blue-800 transition-colors"
                    @click="postNewComment"
                  >
                    发布评论
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
import CommentItem from '@/components/article/CommentItem.vue'

const route = useRoute()
const userStore = useUserStore()

const article = ref({})
const loading = ref(true)
const comments = ref([])
const commentCount = ref(0)
const commentText = ref('')
const isDigged = ref(false)
const isCollected = ref(false)
const headings = ref([])

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
  try {
    const id = route.params.id
    const res = await getArticleDetail(id)
    article.value = res.data || {}
    if (article.value.content) {
      article.value.content = extractHeadings(marked(article.value.content))
    }
    if (userStore.isLoggedIn) {
      recordArticleView({ articleID: Number(id), timeSecond: 0 })
    }
  } catch { /* ignore */ }
  loading.value = false
}

async function fetchComments() {
  try {
    const res = await getCommentList({ articleID: route.params.id, page: 1, limit: 50 })
    comments.value = res.data?.list || []
    commentCount.value = res.data?.count || 0
  } catch { /* ignore */ }
}

async function handleDigg() {
  if (!userStore.isLoggedIn) return
  try {
    await diggArticle(route.params.id)
    isDigged.value = !isDigged.value
    article.value.diggCount = (article.value.diggCount || 0) + (isDigged.value ? 1 : -1)
  } catch { /* ignore */ }
}

async function handleCollect() {
  if (!userStore.isLoggedIn) return
  try {
    await collectArticle({ articleID: Number(route.params.id), collectID: 0 })
    isCollected.value = !isCollected.value
    article.value.collectCount = (article.value.collectCount || 0) + (isCollected.value ? 1 : -1)
  } catch { /* ignore */ }
}

function handleShare() {
  navigator.clipboard?.writeText(window.location.href)
}

async function postNewComment() {
  if (!commentText.value.trim() || !userStore.isLoggedIn) return
  try {
    await postComment({
      content: commentText.value.trim(),
      articleID: Number(route.params.id),
      parentID: 0
    })
    commentText.value = ''
    fetchComments()
  } catch { /* ignore */ }
}

async function handleReply({ content, parentID, rootID }) {
  try {
    await postComment({ content, articleID: Number(route.params.id), parentID, rootID })
    fetchComments()
  } catch { /* ignore */ }
}

async function handleCommentDigg(id) {
  if (!userStore.isLoggedIn) return
  try {
    await diggComment(id)
  } catch { /* ignore */ }
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
