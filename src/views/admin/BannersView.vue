<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">轮播图管理</h2>
      <button class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity" @click="showCreate = true">添加轮播图</button>
    </header>

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
        <button class="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl" @click="createNewBanner">创建</button>
        <button class="px-6 py-2 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100" @click="showCreate = false">取消</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="banner in banners" :key="banner.id" class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div class="h-40 bg-slate-100">
          <img v-if="banner.cover" :src="banner.cover" :alt="'Banner'" class="w-full h-full object-cover" />
        </div>
        <div class="p-4">
          <p class="text-xs text-slate-500 truncate">{{ banner.href || '无链接' }}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-[10px] font-bold px-2 py-1 rounded-full" :class="banner.isShow ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'">
              {{ banner.isShow ? '显示中' : '已隐藏' }}
            </span>
            <button class="text-[10px] font-bold text-red-600 hover:underline" @click="deleteBannerById(banner.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBannerList, createBanner, deleteBanner } from '@/api/banner'

const banners = ref([])
const showCreate = ref(false)
const newBanner = ref({ cover: '', href: '', isShow: true })

async function fetchBanners() {
  try {
    const res = await getBannerList()
    banners.value = res.data?.list || []
  } catch { /* ignore */ }
}

async function createNewBanner() {
  try {
    await createBanner(newBanner.value)
    showCreate.value = false
    newBanner.value = { cover: '', href: '', isShow: true }
    fetchBanners()
  } catch { /* ignore */ }
}

async function deleteBannerById(id) {
  if (!confirm('确认删除？')) return
  try {
    await deleteBanner({ IDList: [id] })
    fetchBanners()
  } catch { /* ignore */ }
}

onMounted(fetchBanners)
</script>
