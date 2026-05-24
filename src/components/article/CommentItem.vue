<template>
  <div class="flex gap-4">
    <img
      v-if="comment.userAvatar"
      :src="comment.userAvatar"
      :alt="comment.userNickName"
      class="w-10 h-10 rounded-full flex-shrink-0"
    />
    <div v-else class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <span class="text-xs font-bold text-blue-600">{{ (comment.userNickName || '?')[0] }}</span>
    </div>
    <div class="flex-1">
      <div class="bg-blue-50/50 p-5 rounded-xl rounded-tl-none border border-blue-100">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-sm text-on-surface">
            {{ comment.userNickName || '匿名' }}
            <span v-if="isAuthor" class="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-label uppercase">作者</span>
          </span>
          <span class="text-[10px] text-slate-400 font-label uppercase tracking-widest">{{ timeAgo(comment.createdAt) }}</span>
        </div>
        <p class="text-sm text-on-surface-variant leading-relaxed">{{ comment.content }}</p>
      </div>
      <div class="flex gap-4 mt-2 px-2">
        <button class="text-[10px] font-bold text-primary uppercase tracking-widest" @click="showReplyInput = !showReplyInput">回复</button>
        <button class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest disabled:opacity-50" :disabled="isPending(comment.id)" @click="$emit('digg', comment.id)">
          <span v-if="isPending(comment.id)" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          赞同 ({{ comment.diggCount || 0 }})
        </button>
        <button
          v-if="canDelete(comment)"
          class="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest disabled:opacity-50"
          :disabled="deleteActionId === comment.id"
          @click="deleteCommentItem(comment.id)"
        >
          <span v-if="deleteActionId === comment.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          删除
        </button>
      </div>

      <div v-if="showReplyInput" class="mt-4 flex gap-3">
        <input
          v-model="replyText"
          class="flex-1 bg-white border border-blue-200 px-3 py-2 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          placeholder="回复..."
          @keyup.enter="submitReply"
        />
        <button class="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs rounded font-bold disabled:cursor-not-allowed disabled:opacity-60" :disabled="isPending(comment.id)" @click="submitReply">
          <span v-if="isPending(comment.id)" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          发送
        </button>
      </div>

      <div v-if="childComments.length > 0" class="mt-6 space-y-4 ml-6 pl-6 border-l border-blue-100">
        <div v-for="child in childComments" :key="child.id" class="flex gap-3">
          <img
            v-if="child.userAvatar"
            :src="child.userAvatar"
            :alt="child.userNickName"
            class="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div v-else class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span class="text-[10px] font-bold text-blue-600">{{ (child.userNickName || '?')[0] }}</span>
          </div>
          <div class="flex-1">
            <div class="bg-blue-100/30 p-4 rounded-xl rounded-tl-none border border-blue-100">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-sm text-on-surface">
                  {{ child.userNickName || '匿名' }}
                  <span v-if="child.userID === articleAuthorId" class="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-label uppercase">作者</span>
                </span>
                <span class="text-[10px] text-slate-400 font-label uppercase tracking-widest">{{ timeAgo(child.createdAt) }}</span>
              </div>
              <p class="text-sm text-on-surface-variant leading-relaxed">{{ child.content }}</p>
            </div>
            <div class="flex gap-4 mt-2 px-2">
              <button class="text-[10px] font-bold text-primary uppercase tracking-widest" @click="replyToChild = child.id; childReplyText = ''">回复</button>
              <button class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest disabled:opacity-50" :disabled="isPending(child.id)" @click="$emit('digg', child.id)">
                <span v-if="isPending(child.id)" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                赞同 ({{ child.diggCount || 0 }})
              </button>
              <button
                v-if="canDelete(child)"
                class="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest disabled:opacity-50"
                :disabled="deleteActionId === child.id"
                @click="deleteCommentItem(child.id)"
              >
                <span v-if="deleteActionId === child.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                删除
              </button>
            </div>
            <div v-if="replyToChild === child.id" class="mt-3 flex gap-3">
              <input
                v-model="childReplyText"
                class="flex-1 bg-white border border-blue-200 px-3 py-2 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="回复..."
                @keyup.enter="submitChildReply(child)"
              />
              <button class="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs rounded font-bold disabled:cursor-not-allowed disabled:opacity-60" :disabled="isPending(child.id)" @click="submitChildReply(child)">
                <span v-if="isPending(child.id)" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                发送
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
        {{ errorMsg }}
      </div>

      <button
        v-if="hasMoreChildren && !childrenLoaded"
        class="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
        :disabled="childrenLoading"
        @click="loadChildren"
      >
        <span v-if="childrenLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
        {{ childrenLoading ? '加载中...' : '查看更多回复' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getChildComments, deleteComment } from '@/api/comment'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  comment: { type: Object, required: true },
  articleAuthorId: { type: Number, default: null },
  pendingActionId: { type: Number, default: null }
})

const emit = defineEmits(['reply', 'digg', 'deleted'])
const userStore = useUserStore()

const childComments = ref([])
const showReplyInput = ref(false)
const replyText = ref('')
const replyToChild = ref(null)
const childReplyText = ref('')
const childrenLoaded = ref(false)
const hasMoreChildren = ref(true)
const childrenLoading = ref(false)
const deleteActionId = ref(null)
const errorMsg = ref('')

const isAuthor = props.comment.userID === props.articleAuthorId

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

async function loadChildren() {
  childrenLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getChildComments({ root: props.comment.id, page: 1, limit: 50 })
    childComments.value = res.data?.list || []
    childrenLoaded.value = true
    hasMoreChildren.value = false
  } catch (e) {
    errorMsg.value = e.message || '回复加载失败'
  } finally {
    childrenLoading.value = false
  }
}

function isPending(id) {
  return props.pendingActionId === id
}

function canDelete(item) {
  if (!userStore.isLoggedIn) return false
  return userStore.isAdmin || Number(userStore.userInfo?.id) === Number(item.userID)
}

async function deleteCommentItem(id) {
  deleteActionId.value = id
  errorMsg.value = ''
  try {
    await deleteComment(id)
    emit('deleted')
  } catch (e) {
    errorMsg.value = e.message || '评论删除失败'
  } finally {
    deleteActionId.value = null
  }
}

function submitReply() {
  if (!replyText.value.trim()) return
  emit('reply', {
    content: replyText.value.trim(),
    parentID: props.comment.id,
    rootID: props.comment.rootID || props.comment.id
  })
  replyText.value = ''
  showReplyInput.value = false
}

function submitChildReply(child) {
  if (!childReplyText.value.trim()) return
  emit('reply', {
    content: childReplyText.value.trim(),
    parentID: child.id,
    rootID: props.comment.rootID || props.comment.id
  })
  childReplyText.value = ''
  replyToChild.value = null
}

onMounted(() => {
  if (props.comment.childCount > 0) {
    hasMoreChildren.value = true
  } else {
    hasMoreChildren.value = false
  }
})
</script>
