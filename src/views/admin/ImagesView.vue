<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">媒体库</h2>
      <button class="text-sm font-bold text-primary flex items-center gap-2 hover:underline" @click="triggerUpload">
        <span class="material-symbols-outlined text-lg">upload</span>
        上传新素材
      </button>
      <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleUpload" />
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="img in images" :key="img.id" class="aspect-square rounded-2xl overflow-hidden relative group border border-slate-200">
        <img :src="img.webPath || `/api/image?id=${img.id}`" :alt="img.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button class="p-2 bg-white rounded-lg" @click="copyImageUrl(img)">
            <span class="material-symbols-outlined text-primary text-sm">content_copy</span>
          </button>
          <button class="p-2 bg-white rounded-lg" @click="deleteImage(img.id)">
            <span class="material-symbols-outlined text-red-600 text-sm">delete</span>
          </button>
        </div>
      </div>
      <div class="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer bg-white" @click="triggerUpload">
        <span class="material-symbols-outlined text-3xl">add_photo_alternate</span>
        <span class="text-[10px] font-bold uppercase tracking-wider mt-2">添加素材</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getImageList, uploadImage, deleteImages } from '@/api/image'

const images = ref([])
const fileInput = ref(null)

async function fetchImages() {
  try {
    const res = await getImageList({ page: 1, limit: 50 })
    images.value = res.data?.list || []
  } catch { /* ignore */ }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function handleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    await uploadImage(file)
    fetchImages()
  } catch { /* ignore */ }
  e.target.value = ''
}

function copyImageUrl(img) {
  const url = img.webPath || `/api/image?id=${img.id}`
  navigator.clipboard?.writeText(url)
}

async function deleteImage(id) {
  if (!confirm('确认删除？')) return
  try {
    await deleteImages({ IDlist: [id] })
    fetchImages()
  } catch { /* ignore */ }
}

onMounted(fetchImages)
</script>
