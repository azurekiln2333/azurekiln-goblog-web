<template>
  <main class="pt-24 pb-12 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-12 gap-8">
      <aside class="col-span-12 lg:col-span-4">
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-bold text-sm">消息中心</h3>
            <button class="text-xs font-bold text-primary hover:underline" @click="markAllRead">全部已读</button>
          </div>
          <div class="divide-y divide-slate-50">
            <button
              v-for="tab in messageTabs"
              :key="tab.type"
              class="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              :class="activeType === tab.type ? 'bg-blue-50/50' : ''"
              @click="switchType(tab.type)"
            >
              <span class="material-symbols-outlined text-primary">{{ tab.icon }}</span>
              <span class="text-sm font-medium flex-1">{{ tab.label }}</span>
              <span v-if="unreadCounts[tab.type] > 0" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ unreadCounts[tab.type] }}</span>
            </button>
          </div>
        </div>
      </aside>

      <div class="col-span-12 lg:col-span-8">
        <div class="bg-white rounded-xl shadow-sm border border-slate-100">
          <div class="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-bold text-sm">{{ currentTabLabel }}</h3>
            <button v-if="messages.length > 0" class="text-xs font-bold text-red-500 hover:underline" @click="deleteSelected">删除选中</button>
          </div>
          <div class="divide-y divide-slate-50">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="p-4 hover:bg-slate-50 transition-colors"
              :class="!msg.isRead ? 'bg-blue-50/30' : ''"
            >
              <div class="flex items-start gap-3">
                <input type="checkbox" v-model="selectedIds" :value="msg.id" class="mt-1" />
                <div class="flex-1">
                  <p class="text-sm text-on-surface leading-relaxed">{{ msg.content }}</p>
                  <p class="text-[10px] text-slate-400 mt-2">{{ formatDate(msg.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="messages.length === 0" class="p-12 text-center text-slate-400 text-sm">
            暂无消息
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMessageList, checkUnread, clearMessages, deleteMessages } from '@/api/message'

const activeType = ref(0)
const messages = ref([])
const unreadCounts = ref({})
const selectedIds = ref([])

const messageTabs = [
  { type: 0, label: '评论通知', icon: 'chat_bubble' },
  { type: 1, label: '回复通知', icon: 'reply' },
  { type: 2, label: '点赞通知', icon: 'thumb_up' },
  { type: 3, label: '收藏通知', icon: 'bookmark' },
  { type: 4, label: '私信', icon: 'mail' },
  { type: 5, label: '系统通知', icon: 'notifications' }
]

const currentTabLabel = computed(() => {
  return messageTabs.find(t => t.type === activeType.value)?.label || '消息'
})

async function fetchMessages() {
  try {
    const res = await getMessageList({ type: activeType.value, page: 1, limit: 50 })
    messages.value = res.data?.list || []
  } catch { /* ignore */ }
}

async function fetchUnread() {
  try {
    const res = await checkUnread()
    unreadCounts.value = res.data || {}
  } catch { /* ignore */ }
}

function switchType(type) {
  activeType.value = type
  selectedIds.value = []
  fetchMessages()
}

async function markAllRead() {
  try {
    const tab = messageTabs.find(t => t.type === activeType.value)
    const body = {}
    if (activeType.value <= 1) body.commentMessage = true
    if (activeType.value === 2 || activeType.value === 3) body.diggAndCollectMessage = true
    if (activeType.value === 4) body.privateMessage = true
    if (activeType.value === 5) body.systemMessage = true
    await clearMessages(body)
    fetchMessages()
    fetchUnread()
  } catch { /* ignore */ }
}

async function deleteSelected() {
  if (selectedIds.value.length === 0) return
  try {
    await deleteMessages({ messageID: selectedIds.value })
    selectedIds.value = []
    fetchMessages()
    fetchUnread()
  } catch { /* ignore */ }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchUnread()
  fetchMessages()
})
</script>
