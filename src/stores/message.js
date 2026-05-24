import { defineStore } from 'pinia'
import { ref } from 'vue'
import { checkUnread } from '@/api/message'
import { useUiStore } from '@/stores/ui'

export const useMessageStore = defineStore('message', () => {
  const unreadCounts = ref({})
  const loaded = ref(false)

  async function fetchUnreadCounts() {
    const uiStore = useUiStore()
    try {
      const res = await checkUnread()
      unreadCounts.value = res.data || {}
      loaded.value = true
    } catch (e) {
      uiStore.notify(e.message || '未读消息加载失败', 'error')
    }
  }

  function getTotalUnread() {
    return Object.values(unreadCounts.value).reduce((sum, n) => sum + (Number(n) || 0), 0)
  }

  return {
    unreadCounts,
    loaded,
    fetchUnreadCounts,
    getTotalUnread
  }
})
