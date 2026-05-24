<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">友链管理</h2>
      <button class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity" @click="showCreate = true">添加友链</button>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

    <div v-if="showCreate" class="bg-white p-6 rounded-2xl border border-slate-100 mb-8">
      <h3 class="font-bold mb-4">新建友链</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">站点名称</label>
          <input v-model="newLink.name" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" />
        </div>
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">站点 URL</label>
          <input v-model="newLink.url" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" />
        </div>
        <div>
          <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Logo URL</label>
          <input v-model="newLink.logo" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" />
        </div>
        <div class="flex items-center gap-2 pt-5">
          <input type="checkbox" v-model="newLink.is_show" id="link-show" />
          <label for="link-show" class="text-sm">显示</label>
        </div>
      </div>
      <div class="flex gap-3">
        <button class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-60" :disabled="creating" @click="createNewLink">
          <span v-if="creating" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          {{ creating ? '创建中...' : '创建' }}
        </button>
        <button class="px-6 py-2 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50" :disabled="creating" @click="showCreate = false">取消</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">名称</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">URL</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">状态</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="loading">
            <td colspan="4" class="px-6 py-12 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载友链中</p>
            </td>
          </tr>
          <tr v-for="link in links" :key="link.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ link.name }}</td>
            <td class="px-6 py-4 text-slate-500 text-xs">{{ link.url }}</td>
            <td class="px-6 py-4">
              <span class="text-[10px] font-bold px-2 py-1 rounded-full" :class="link.is_show ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'">
                {{ link.is_show ? '显示' : '隐藏' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50" :disabled="deletingId === link.id" @click="deleteLink(link.id)">
                <span v-if="deletingId === link.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                删除
              </button>
            </td>
          </tr>
          <tr v-if="!loading && links.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-sm text-slate-400">暂无友链</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFriendLinks, createFriendLink, deleteFriendLink } from '@/api/friend'

const links = ref([])
const showCreate = ref(false)
const newLink = ref({ name: '', url: '', logo: '', is_show: true })
const loading = ref(false)
const creating = ref(false)
const deletingId = ref(null)
const errorMsg = ref('')

async function fetchLinks() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getFriendLinks()
    links.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '友链加载失败'
  } finally {
    loading.value = false
  }
}

async function createNewLink() {
  creating.value = true
  errorMsg.value = ''
  try {
    await createFriendLink(newLink.value)
    showCreate.value = false
    newLink.value = { name: '', url: '', logo: '', is_show: true }
    await fetchLinks()
  } catch (e) {
    errorMsg.value = e.message || '友链创建失败'
  } finally {
    creating.value = false
  }
}

async function deleteLink(id) {
  if (!confirm('确认删除？')) return
  deletingId.value = id
  errorMsg.value = ''
  try {
    await deleteFriendLink({ IDList: [id] })
    await fetchLinks()
  } catch (e) {
    errorMsg.value = e.message || '友链删除失败'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchLinks)
</script>
