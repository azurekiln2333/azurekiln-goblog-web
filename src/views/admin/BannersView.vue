<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">轮播图管理</h2>
      <button class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity" @click="showCreate = true">添加轮播图</button>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

    <div v-if="showCreate" class="bg-white p-6 rounded-2xl border border-slate-100 mb-8">
      <h3 class="font-bold mb-4">新建轮播图</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">封面图 URL</label>
          <input v-model="newBanner.cover" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" />
        </div>
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">链接地址</label>
          <input v-model="newBanner.href" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" />
        </div>
      </div>
      <div class="flex items-center gap-2 mb-4">
        <input type="checkbox" v-model="newBanner.isShow" id="banner-show" />
        <label for="banner-show" class="text-sm">显示</label>
      </div>
      <div class="flex gap-3">
        <button class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-60" :disabled="creating" @click="createNewBanner">
          <span v-if="creating" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          {{ creating ? '创建中...' : '创建' }}
        </button>
        <button class="px-6 py-2 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50" :disabled="creating" @click="showCreate = false">取消</button>
      </div>
    </div>

    <div v-if="loading" class="py-20 text-center text-slate-400">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载轮播图中</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="banner in banners" :key="banner.id" class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div class="h-40 bg-slate-100">
          <img v-if="banner.cover" :src="banner.cover" :alt="'Banner'" class="w-full h-full object-cover" />
        </div>
        <div class="p-4">
          <div v-if="editingId === banner.id" class="space-y-3">
            <div>
              <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">封面图 URL</label>
              <input v-model="editBanner.cover" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs mt-1" />
            </div>
            <div>
              <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">链接地址</label>
              <input v-model="editBanner.href" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs mt-1" />
            </div>
            <label class="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" v-model="editBanner.isShow" />
              显示
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                :disabled="updatingId === banner.id"
                @click="saveBanner(banner.id)"
              >
                <span v-if="updatingId === banner.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                保存
              </button>
              <button class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50" :disabled="updatingId === banner.id" @click="cancelEdit">
                取消
              </button>
            </div>
          </div>
          <template v-else>
          <p class="text-xs text-slate-500 truncate">{{ banner.href || '无链接' }}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-[10px] font-bold px-2 py-1 rounded-full" :class="banner.isShow ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'">
              {{ banner.isShow ? '显示中' : '已隐藏' }}
            </span>
            <div class="flex gap-2">
              <button class="text-[10px] font-bold text-primary hover:underline" @click="startEdit(banner)">编辑</button>
              <button
                class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline disabled:opacity-50"
                :disabled="updatingId === banner.id"
                @click="toggleBanner(banner)"
              >
                <span v-if="updatingId === banner.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ banner.isShow ? '隐藏' : '显示' }}
              </button>
              <button class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50" :disabled="deletingId === banner.id" @click="deleteBannerById(banner.id)">
                <span v-if="deletingId === banner.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                删除
              </button>
            </div>
          </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="!loading && banners.length === 0" class="py-16 text-center text-sm text-slate-400">
      暂无轮播图
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBannerList, createBanner, deleteBanner, updateBanner } from '@/api/banner'

const banners = ref([])
const showCreate = ref(false)
const newBanner = ref({ cover: '', href: '', isShow: true })
const editBanner = ref({ cover: '', href: '', isShow: true })
const loading = ref(false)
const creating = ref(false)
const deletingId = ref(null)
const updatingId = ref(null)
const editingId = ref(null)
const errorMsg = ref('')

async function fetchBanners() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getBannerList()
    banners.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '轮播图加载失败'
  } finally {
    loading.value = false
  }
}

async function createNewBanner() {
  creating.value = true
  errorMsg.value = ''
  try {
    await createBanner(newBanner.value)
    showCreate.value = false
    newBanner.value = { cover: '', href: '', isShow: true }
    await fetchBanners()
  } catch (e) {
    errorMsg.value = e.message || '轮播图创建失败'
  } finally {
    creating.value = false
  }
}

function startEdit(banner) {
  editingId.value = banner.id
  editBanner.value = {
    cover: banner.cover || '',
    href: banner.href || '',
    isShow: banner.isShow !== false
  }
  errorMsg.value = ''
}

function cancelEdit() {
  editingId.value = null
  editBanner.value = { cover: '', href: '', isShow: true }
}

async function saveBanner(id) {
  updatingId.value = id
  errorMsg.value = ''
  try {
    await updateBanner(id, editBanner.value)
    cancelEdit()
    await fetchBanners()
  } catch (e) {
    errorMsg.value = e.message || '轮播图更新失败'
  } finally {
    updatingId.value = null
  }
}

async function toggleBanner(banner) {
  updatingId.value = banner.id
  errorMsg.value = ''
  try {
    await updateBanner(banner.id, {
      cover: banner.cover || '',
      href: banner.href || '',
      isShow: !banner.isShow
    })
    await fetchBanners()
  } catch (e) {
    errorMsg.value = e.message || '轮播图状态更新失败'
  } finally {
    updatingId.value = null
  }
}

async function deleteBannerById(id) {
  if (!confirm('确认删除？')) return
  deletingId.value = id
  errorMsg.value = ''
  try {
    await deleteBanner({ IDList: [id] })
    await fetchBanners()
  } catch (e) {
    errorMsg.value = e.message || '轮播图删除失败'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchBanners)
</script>
