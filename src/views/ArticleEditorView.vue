<template>
  <main class="pt-24 pb-12 px-6 max-w-4xl mx-auto">
    <h1 class="font-headline text-3xl font-extrabold text-on-surface mb-8">{{ isEdit ? '编辑文章' : '撰写新文章' }}</h1>

    <div class="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
      <div>
        <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">标题</label>
        <input
          v-model="form.title"
          placeholder="文章标题"
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-headline font-bold mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
        />
      </div>

      <div>
        <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">摘要</label>
        <textarea
          v-model="form.abstract"
          placeholder="文章摘要..."
          rows="2"
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none resize-none"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">分类</label>
          <select v-model="form.categoryID" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none">
            <option :value="null">选择分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">标签（逗号分隔）</label>
          <input
            v-model="tagInput"
            placeholder="Go, Gin, Vue"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">封面图 URL</label>
        <input
          v-model="form.cover"
          placeholder="https://..."
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
        />
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">正文 (Markdown)</label>
          <button
            class="text-xs font-bold text-primary hover:underline"
            @click="showPreview = !showPreview"
          >
            {{ showPreview ? '隐藏预览' : '显示预览' }}
          </button>
        </div>
        <textarea
          v-model="form.content"
          placeholder="使用 Markdown 撰写文章内容..."
          rows="20"
          class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none font-mono resize-y"
        ></textarea>
      </div>

      <div v-if="showPreview && form.content" class="border border-blue-100 rounded-xl p-6 bg-slate-50">
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="form.openComment" id="open-comment" />
          <label for="open-comment" class="text-sm">允许评论</label>
        </div>
      </div>

      <div v-if="errorMsg" class="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {{ errorMsg }}
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          class="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          :disabled="submitting"
          @click="$router.back()"
        >
          取消
        </button>
        <button
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
          @click="handleSubmit(0)"
        >
          <span v-if="submittingStatus === 0" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          {{ submittingStatus === 0 ? '保存中...' : '保存草稿' }}
        </button>
        <button
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
          @click="handleSubmit(1)"
        >
          <span v-if="submittingStatus === 1" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          {{ submittingStatus === 1 ? '提交中...' : '提交审核' }}
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { createArticle, updateArticle, getArticleDetail, getCategoryList } from '@/api/article'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const isEdit = computed(() => !!route.params.id)
const form = ref({
  id: null,
  title: '',
  abstract: '',
  content: '',
  categoryID: null,
  tagList: [],
  cover: '',
  openComment: true,
  status: 0
})
const tagInput = ref('')
const categories = ref([])
const showPreview = ref(false)
const submitting = ref(false)
const submittingStatus = ref(null)
const errorMsg = ref('')

const renderedContent = computed(() => {
  if (!form.value.content) return ''
  return marked(form.value.content)
})

async function fetchCategories() {
  try {
    const res = await getCategoryList({ type: 'self', page: 1, limit: 100 })
    categories.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '分类加载失败'
  }
}

async function fetchArticle() {
  if (!route.params.id) return
  try {
    const res = await getArticleDetail(route.params.id)
    const art = res.data || {}
    form.value = {
      id: art.id,
      title: art.title || '',
      abstract: art.abstract || '',
      content: art.content || '',
      categoryID: art.categoryID || null,
      tagList: art.tagList || [],
      cover: art.cover || '',
      openComment: art.openComment !== false,
      status: art.status || 0
    }
    tagInput.value = (art.tagList || []).join(', ')
  } catch (e) {
    errorMsg.value = e.message || '文章加载失败'
  }
}

async function handleSubmit(status) {
  if (submitting.value) return
  errorMsg.value = ''
  if (!form.value.title.trim()) {
    errorMsg.value = '请先填写文章标题'
    uiStore.notify(errorMsg.value, 'warning')
    return
  }
  if (!form.value.content.trim()) {
    errorMsg.value = '请先填写文章正文'
    uiStore.notify(errorMsg.value, 'warning')
    return
  }

  submitting.value = true
  submittingStatus.value = status
  form.value.status = status
  form.value.tagList = tagInput.value.split(',').map(t => t.trim()).filter(Boolean)

  try {
    if (isEdit.value) {
      await updateArticle(form.value)
    } else {
      await createArticle(form.value)
    }
    router.push('/user/center')
  } catch (e) {
    errorMsg.value = e.message || '文章保存失败'
  } finally {
    submitting.value = false
    submittingStatus.value = null
  }
}

onMounted(() => {
  fetchCategories()
  fetchArticle()
})
</script>
