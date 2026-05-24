<template>
  <main class="pt-24 pb-12 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-12 gap-8">
      <aside class="col-span-12 lg:col-span-4">
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-bold text-sm">消息中心</h3>
            <button
              class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:opacity-50"
              :disabled="actionLoading === 'read'"
              @click="markAllRead"
            >
              <span v-if="actionLoading === 'read'" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              全部已读
            </button>
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

        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-bold text-sm">通知设置</h3>
            <button
              class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:opacity-50"
              :disabled="confLoading"
              @click="fetchMessageConf"
            >
              <span v-if="confLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              刷新
            </button>
          </div>
          <div v-if="confError" class="m-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {{ confError }}
          </div>
          <div v-if="confLoading && !messageConf" class="p-6 text-center text-slate-400">
            <span class="material-symbols-outlined animate-spin">progress_activity</span>
            <p class="mt-2 text-[10px] font-bold uppercase tracking-widest">加载设置中</p>
          </div>
          <div v-else class="divide-y divide-slate-50">
            <label
              v-for="item in confItems"
              :key="item.key"
              class="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <span class="font-medium text-slate-700">{{ item.label }}</span>
              <input
                type="checkbox"
                class="h-4 w-4"
                :checked="messageConf?.[item.key] !== false"
                :disabled="confSavingKey === item.key"
                @change="updateConf(item.key, $event.target.checked)"
              />
            </label>
          </div>
        </div>
      </aside>

      <div class="col-span-12 lg:col-span-8">
        <div v-if="activeType === 4" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 class="font-bold text-sm">私信会话</h3>
              <button class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:opacity-50" :disabled="chatSessionsLoading" @click="fetchChatSessions">
                <span v-if="chatSessionsLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                刷新
              </button>
            </div>
            <div v-if="chatSessionsLoading" class="p-10 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载会话中</p>
            </div>
            <div v-else-if="chatSessions.length === 0" class="p-10 text-center text-sm text-slate-400">
              暂无会话
            </div>
            <div v-else class="divide-y divide-slate-50">
              <button
                v-for="session in chatSessions"
                :key="sessionKey(session)"
                class="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                :class="Number(activeChatUserId) === Number(sessionUserId(session)) ? 'bg-blue-50/60' : ''"
                @click="openChat(sessionUserId(session))"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-bold text-on-surface truncate">{{ sessionTitle(session) }}</p>
                  <span v-if="session.unreadCount > 0" class="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{{ session.unreadCount }}</span>
                </div>
                <p class="mt-1 truncate text-xs text-on-surface-variant">{{ messageText(session.lastMessage) || '暂无消息预览' }}</p>
              </button>
            </div>
          </div>

          <div class="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 border-b border-slate-100">
              <h3 class="font-bold text-sm">{{ activeChatTitle }}</h3>
            </div>
            <div v-if="chatError" class="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {{ chatError }}
            </div>
            <div v-if="!activeChatUserId" class="p-12 text-center text-sm text-slate-400">
              选择一个会话，或从用户主页点击私信开始聊天
            </div>
            <template v-else>
              <div v-if="chatLoading" class="p-12 text-center text-slate-400">
                <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载聊天记录中</p>
              </div>
              <div v-else class="max-h-[520px] min-h-[360px] space-y-3 overflow-y-auto bg-slate-50 p-4">
                <div
                  v-for="msg in chatMessages"
                  :key="msg.id"
                  class="flex"
                  :class="msg.isMe ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[78%] rounded-lg px-4 py-3 text-sm shadow-sm"
                    :class="msg.isMe ? 'bg-primary text-white' : 'bg-white text-on-surface'"
                  >
                    <p class="whitespace-pre-wrap leading-relaxed">{{ messageText(msg) }}</p>
                    <p class="mt-2 text-[10px]" :class="msg.isMe ? 'text-blue-100' : 'text-slate-400'">{{ formatDate(msg.createdAt) }}</p>
                  </div>
                </div>
                <div v-if="chatMessages.length === 0" class="py-16 text-center text-sm text-slate-400">
                  暂无聊天记录
                </div>
              </div>
              <form class="flex gap-3 border-t border-slate-100 p-4" @submit.prevent="sendPrivateMessage">
                <textarea
                  v-model="chatText"
                  class="min-h-12 flex-1 resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
                  placeholder="输入私信内容..."
                  rows="2"
                ></textarea>
                <button class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" :disabled="chatSending">
                  <span v-if="chatSending" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  {{ chatSending ? '发送中...' : '发送' }}
                </button>
              </form>
            </template>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100">
          <template v-if="activeType !== 4">
          <div class="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 class="font-bold text-sm">{{ currentTabLabel }}</h3>
            <button
              v-if="messages.length > 0"
              class="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:underline disabled:opacity-50"
              :disabled="selectedIds.length === 0 || actionLoading === 'delete'"
              @click="deleteSelected"
            >
              <span v-if="actionLoading === 'delete'" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              删除选中
            </button>
          </div>
          <div v-if="errorMsg" class="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {{ errorMsg }}
          </div>
          <div v-if="loading" class="p-12 text-center text-slate-400">
            <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载消息中</p>
          </div>
          <div v-else class="divide-y divide-slate-50">
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
          <div v-if="!loading && messages.length === 0" class="p-12 text-center text-slate-400 text-sm">
            暂无消息
          </div>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getMessageList, checkUnread, clearMessages, deleteMessages, getMessageConf, updateMessageConf } from '@/api/message'
import { getChatHistory, getChatSessions, sendChat } from '@/api/chat'

const route = useRoute()
const activeType = ref(0)
const messages = ref([])
const unreadCounts = ref({})
const selectedIds = ref([])
const loading = ref(false)
const errorMsg = ref('')
const actionLoading = ref('')
const chatSessions = ref([])
const chatMessages = ref([])
const activeChatUserId = ref(null)
const activeChatName = ref('')
const chatText = ref('')
const chatSessionsLoading = ref(false)
const chatLoading = ref(false)
const chatSending = ref(false)
const chatError = ref('')
const messageConf = ref(null)
const confLoading = ref(false)
const confSavingKey = ref('')
const confError = ref('')

const messageTabs = [
  { type: 0, label: '评论通知', icon: 'chat_bubble' },
  { type: 1, label: '回复通知', icon: 'reply' },
  { type: 2, label: '点赞通知', icon: 'thumb_up' },
  { type: 3, label: '收藏通知', icon: 'bookmark' },
  { type: 4, label: '私信', icon: 'mail' },
  { type: 5, label: '系统通知', icon: 'notifications' }
]

const confItems = [
  { key: 'openCommentMessage', label: '评论通知' },
  { key: 'openReplyMessage', label: '回复通知' },
  { key: 'openDiggMessage', label: '点赞通知' },
  { key: 'openCollectMessage', label: '收藏通知' },
  { key: 'openPrivateMessage', label: '私信通知' }
]

const currentTabLabel = computed(() => {
  return messageTabs.find(t => t.type === activeType.value)?.label || '消息'
})

const activeChatTitle = computed(() => {
  if (!activeChatUserId.value) return '私信'
  return activeChatName.value || `用户 #${activeChatUserId.value}`
})

async function fetchMessages() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getMessageList({ type: activeType.value, page: 1, limit: 50 })
    messages.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '消息加载失败'
  } finally {
    loading.value = false
  }
}

async function fetchUnread() {
  try {
    const res = await checkUnread()
    unreadCounts.value = res.data || {}
  } catch (e) {
    errorMsg.value = e.message || '未读数量加载失败'
  }
}

async function fetchMessageConf() {
  confLoading.value = true
  confError.value = ''
  try {
    const res = await getMessageConf()
    messageConf.value = res.data || {}
  } catch (e) {
    confError.value = e.message || '通知设置加载失败'
  } finally {
    confLoading.value = false
  }
}

async function updateConf(key, value) {
  if (!messageConf.value) return
  const previous = messageConf.value[key] !== false
  messageConf.value = { ...messageConf.value, [key]: value }
  confSavingKey.value = key
  confError.value = ''
  try {
    await updateMessageConf({ [key]: value })
    await fetchMessageConf()
  } catch (e) {
    messageConf.value = { ...messageConf.value, [key]: previous }
    confError.value = e.message || '通知设置保存失败'
  } finally {
    confSavingKey.value = ''
  }
}

function switchType(type) {
  activeType.value = type
  selectedIds.value = []
  if (type === 4) {
    fetchChatSessions()
  } else {
    fetchMessages()
  }
}

async function markAllRead() {
  actionLoading.value = 'read'
  errorMsg.value = ''
  try {
    const tab = messageTabs.find(t => t.type === activeType.value)
    const body = {}
    if (activeType.value <= 1) body.commentMessage = true
    if (activeType.value === 2 || activeType.value === 3) body.diggAndCollectMessage = true
    if (activeType.value === 4) body.privateMessage = true
    if (activeType.value === 5) body.systemMessage = true
    await clearMessages(body)
    await fetchMessages()
    await fetchUnread()
  } catch (e) {
    errorMsg.value = e.message || '全部已读操作失败'
  } finally {
    actionLoading.value = ''
  }
}

async function deleteSelected() {
  if (selectedIds.value.length === 0) return
  actionLoading.value = 'delete'
  errorMsg.value = ''
  try {
    await deleteMessages({ messageID: selectedIds.value })
    selectedIds.value = []
    await fetchMessages()
    await fetchUnread()
  } catch (e) {
    errorMsg.value = e.message || '消息删除失败'
  } finally {
    actionLoading.value = ''
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function fetchChatSessions() {
  chatSessionsLoading.value = true
  chatError.value = ''
  try {
    const res = await getChatSessions({ page: 1, limit: 50 })
    chatSessions.value = res.data?.list || []
  } catch (e) {
    chatError.value = e.message || '私信会话加载失败'
  } finally {
    chatSessionsLoading.value = false
  }
}

async function openChat(userId) {
  if (!userId) return
  activeChatUserId.value = Number(userId)
  chatLoading.value = true
  chatError.value = ''
  try {
    const res = await getChatHistory({ userID: activeChatUserId.value, page: 1, limit: 50 })
    chatMessages.value = (res.data?.list || []).slice().reverse()
    activeChatName.value = inferChatName(chatMessages.value, activeChatUserId.value)
  } catch (e) {
    chatMessages.value = []
    chatError.value = e.message || '聊天记录加载失败'
  } finally {
    chatLoading.value = false
  }
}

async function sendPrivateMessage() {
  const content = chatText.value.trim()
  if (!content || !activeChatUserId.value) return
  chatSending.value = true
  chatError.value = ''
  try {
    await sendChat({
      revUserID: Number(activeChatUserId.value),
      msg: { textMsg: { content } }
    })
    chatText.value = ''
    await openChat(activeChatUserId.value)
    await fetchChatSessions()
  } catch (e) {
    chatError.value = e.message || '私信发送失败'
  } finally {
    chatSending.value = false
  }
}

function sessionUserId(session) {
  return session.userId || session.userID || session.UserID
}

function sessionKey(session) {
  return session.id || session.uniqueId || sessionUserId(session)
}

function sessionTitle(session) {
  return session.userNickName || session.userNickname || session.nickname || session.nickName || `用户 #${sessionUserId(session)}`
}

function messageText(message) {
  const msg = message?.msg || message?.Msg || message || {}
  return msg.textMsg?.content || msg.TextMsg?.content || msg.markdownMsg?.content || msg.MarkdownMsg?.content || msg.imageMsg?.src || msg.ImageMsg?.src || ''
}

function inferChatName(list, userId) {
  const item = list.find(msg => Number(msg.sendUserID) === Number(userId) || Number(msg.revUserID) === Number(userId))
  if (!item) return ''
  return item.isMe ? (item.revUserNickname || item.revUserNickName || '') : (item.sendUserNickname || item.sendUserNickName || '')
}

onMounted(() => {
  fetchUnread()
  fetchMessageConf()
  if (route.query.userId) {
    activeType.value = 4
    fetchChatSessions()
    openChat(route.query.userId)
  } else {
    fetchMessages()
  }
})

watch(() => route.query.userId, (userId) => {
  if (!userId) return
  activeType.value = 4
  fetchChatSessions()
  openChat(userId)
})
</script>
