<template>
  <div class="p-8">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">分类管理</h2>
        <p class="mt-1 text-xs text-slate-500">管理全站文章分类，支持创建、重命名和删除。</p>
      </div>
      <button
        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="creating"
        @click="showCreate = true"
      >
        <span class="material-symbols-outlined text-base">add</span>
        新建分类
      </button>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
      {{ successMsg }}
    </div>

    <div v-if="showCreate" class="bg-white p-6 rounded-2xl border border-slate-100 mb-8 shadow-sm">
      <h3 class="font-bold mb-4 text-slate-900">新建分类</h3>
      <div class="flex flex-col gap-3 md:flex-row">
        <div class="flex-1">
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">分类名称</label>
          <input
            v-model="newTitle"
            maxlength="32"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
            placeholder="输入 1-32 个字符"
            @keyup.enter="createCategory"
          />
        </div>
        <div class="flex items-end gap-3">
          <button
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="creating"
            @click="createCategory"
          >
            <span v-if="creating" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
            {{ creating ? '创建中...' : '创建' }}
          </button>
          <button
            class="px-6 py-3 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50"
            :disabled="creating"
            @click="cancelCreate"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">分类</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">作者</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">文章数</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="loading">
            <td colspan="4" class="px-6 py-12 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载分类中</p>
            </td>
          </tr>

          <tr v-for="category in categories" :key="category.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div v-if="editingId === category.id" class="flex min-w-72 max-w-md items-center gap-2">
                <input
                  v-model="editTitle"
                  maxlength="32"
                  class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-primary focus:ring-2 focus:outline-none"
                  @keyup.enter="saveCategory(category)"
                />
              </div>
              <div v-else>
                <p class="font-semibold text-slate-900">{{ category.title }}</p>
                <p class="text-[10px] uppercase tracking-widest text-slate-400">ID {{ category.id }}</p>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="category.avatar"
                  :src="category.avatar"
                  :alt="category.nickname || '用户头像'"
                  class="h-8 w-8 rounded-full bg-slate-100 object-cover"
                />
                <span class="text-slate-600">{{ category.nickname || `用户 ${category.userID || '-'}` }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-slate-500">{{ category.articleCount || 0 }}</td>
            <td class="px-6 py-4">
              <div v-if="editingId === category.id" class="flex flex-wrap gap-2">
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                  :disabled="actionId === category.id"
                  @click="saveCategory(category)"
                >
                  <span v-if="actionId === category.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  保存
                </button>
                <button
                  class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50"
                  :disabled="actionId === category.id"
                  @click="cancelEdit"
                >
                  取消
                </button>
              </div>
              <div v-else-if="confirmDeleteId === category.id" class="flex flex-wrap gap-2">
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50"
                  :disabled="actionId === category.id"
                  @click="deleteCategoryById(category.id)"
                >
                  <span v-if="actionId === category.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  确认删除
                </button>
                <button
                  class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50"
                  :disabled="actionId === category.id"
                  @click="confirmDeleteId = null"
                >
                  取消
                </button>
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  class="text-[10px] font-bold text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                  :disabled="!canEditCategory(category)"
                  :title="canEditCategory(category) ? '重命名分类' : '后端仅允许分类作者重命名'"
                  @click="startEdit(category)"
                >
                  重命名
                </button>
                <button class="text-[10px] font-bold text-red-600 hover:underline" @click="confirmDeleteId = category.id">
                  删除
                </button>
                <span v-if="!canEditCategory(category)" class="text-[10px] text-slate-400">仅作者可改名</span>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && categories.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-sm text-slate-400">暂无分类</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > limit" class="flex justify-center gap-2 pt-8">
      <button
        v-for="p in totalPages"
        :key="p"
        class="w-10 h-10 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :class="p === page ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-blue-50 border border-blue-100'"
        :disabled="loading"
        @click="changePage(p)"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { createOrUpdateCategory, deleteCategory, getCategoryList } from '@/api/article'
import { useUiStore } from '@/stores/ui'
import { useUserStore } from '@/stores/user'

const uiStore = useUiStore()
const userStore = useUserStore()

const categories = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const loading = ref(false)
const creating = ref(false)
const actionId = ref(null)
const showCreate = ref(false)
const newTitle = ref('')
const editingId = ref(null)
const editTitle = ref('')
const confirmDeleteId = ref(null)
const errorMsg = ref('')
const successMsg = ref('')

const totalPages = computed(() => Math.ceil(total.value / limit.value))
const currentUserId = computed(() => userStore.userInfo?.id || userStore.userInfo?.userID || userStore.userInfo?.ID)

async function fetchCategories() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getCategoryList({ type: 'admin', page: page.value, limit: limit.value })
    categories.value = res.data?.list || []
    total.value = res.data?.count || 0
  } catch (e) {
    errorMsg.value = e.message || '分类列表加载失败'
  } finally {
    loading.value = false
  }
}

function normalizeTitle(value) {
  return value.trim()
}

function setSuccess(message) {
  successMsg.value = message
  uiStore.notify(message, 'success')
}

function validateTitle(title) {
  if (!title) {
    errorMsg.value = '请填写分类名称'
    uiStore.notify(errorMsg.value, 'warning')
    return false
  }
  if (title.length > 32) {
    errorMsg.value = '分类名称不能超过 32 个字符'
    uiStore.notify(errorMsg.value, 'warning')
    return false
  }
  return true
}

function canEditCategory(category) {
  return !category.userID || !currentUserId.value || Number(category.userID) === Number(currentUserId.value)
}

async function createCategory() {
  const title = normalizeTitle(newTitle.value)
  if (!validateTitle(title)) return

  creating.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await createOrUpdateCategory({ title }, { silentSuccess: true })
    newTitle.value = ''
    showCreate.value = false
    page.value = 1
    setSuccess('分类创建成功')
    await fetchCategories()
  } catch (e) {
    errorMsg.value = e.message || '分类创建失败'
  } finally {
    creating.value = false
  }
}

function cancelCreate() {
  showCreate.value = false
  newTitle.value = ''
}

function startEdit(category) {
  editingId.value = category.id
  editTitle.value = category.title || ''
  confirmDeleteId.value = null
  errorMsg.value = ''
  successMsg.value = ''
}

function cancelEdit() {
  editingId.value = null
  editTitle.value = ''
}

async function saveCategory(category) {
  const title = normalizeTitle(editTitle.value)
  if (!validateTitle(title)) return
  if (title === category.title) {
    cancelEdit()
    return
  }

  actionId.value = category.id
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await createOrUpdateCategory({ id: category.id, title }, { silentSuccess: true })
    setSuccess('分类已更新')
    cancelEdit()
    await fetchCategories()
  } catch (e) {
    errorMsg.value = e.message || '分类更新失败'
  } finally {
    actionId.value = null
  }
}

async function deleteCategoryById(id) {
  actionId.value = id
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await deleteCategory({ IDList: [id] }, { silentSuccess: true })
    confirmDeleteId.value = null
    setSuccess('分类已删除')
    await fetchCategories()
    if (categories.value.length === 0 && page.value > 1) {
      page.value -= 1
      await fetchCategories()
    }
  } catch (e) {
    errorMsg.value = e.message || '分类删除失败'
  } finally {
    actionId.value = null
  }
}

function changePage(nextPage) {
  if (page.value === nextPage) return
  page.value = nextPage
  confirmDeleteId.value = null
  cancelEdit()
  fetchCategories()
}

onMounted(fetchCategories)
</script>
