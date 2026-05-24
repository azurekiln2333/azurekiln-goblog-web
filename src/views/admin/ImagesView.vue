<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">媒体库</h2>
      <button
        class="text-sm font-bold text-primary flex items-center gap-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="uploading"
        @click="triggerUpload"
      >
        <span class="material-symbols-outlined text-lg" :class="{ 'animate-spin': uploading }">{{ uploading ? 'progress_activity' : 'upload' }}</span>
        {{ uploading ? '上传中...' : '上传新素材' }}
      </button>
      <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleUpload" />
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

    <div v-if="loading" class="py-20 text-center text-slate-400">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载媒体库中</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="img in images" :key="img.id" class="aspect-square rounded-2xl overflow-hidden relative group border border-slate-200">
        <img :src="img.webPath || `/api/image?id=${img.id}`" :alt="img.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button class="p-2 bg-white rounded-lg" @click="copyImageUrl(img)">
            <span class="material-symbols-outlined text-primary text-sm">content_copy</span>
          </button>
          <button class="p-2 bg-white rounded-lg disabled:cursor-not-allowed disabled:opacity-60" :disabled="deletingId === img.id" @click="deleteImage(img.id)">
            <span class="material-symbols-outlined text-red-600 text-sm" :class="{ 'animate-spin': deletingId === img.id }">{{ deletingId === img.id ? 'progress_activity' : 'delete' }}</span>
          </button>
        </div>
      </div>
      <button
        type="button"
        class="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer bg-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="uploading"
        @click="triggerUpload"
      >
        <span class="material-symbols-outlined text-3xl">add_photo_alternate</span>
        <span class="text-[10px] font-bold uppercase tracking-wider mt-2">添加素材</span>
      </button>
    </div>

    <div v-if="!loading && images.length === 0" class="py-16 text-center text-sm text-slate-400">
      暂无素材
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getImageList, uploadImage, deleteImages } from '@/api/image'

const images = ref([])
const fileInput = ref(null)
const loading = ref(false)
const uploading = ref(false)
const deletingId = ref(null)
const errorMsg = ref('')

async function fetchImages() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getImageList({ page: 1, limit: 50 })
    images.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '媒体库加载失败'
  } finally {
    loading.value = false
  }
}

function triggerUpload() {
  if (uploading.value) return
  fileInput.value?.click()
}

async function handleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  errorMsg.value = ''
  try {
    await uploadImage(file)
    await fetchImages()
  } catch (err) {
    errorMsg.value = err.message || '素材上传失败'
  } finally {
    uploading.value = false
  }
  e.target.value = ''
}

function copyImageUrl(img) {
  const url = img.webPath || `/api/image?id=${img.id}`
  navigator.clipboard?.writeText(url)
}

async function deleteImage(id) {
  if (!confirm('确认删除？')) return
  deletingId.value = id
  errorMsg.value = ''
  try {
    await deleteImages({ IDlist: [id] })
    await fetchImages()
  } catch (e) {
    errorMsg.value = e.message || '素材删除失败'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchImages)
</script>
