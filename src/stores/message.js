import { defineStore } from 'pinia'
import { ref } from 'vue'
import { checkUnread } from '@/api/message'

export const useMessageStore = defineStore('message', () => {
  const unreadCounts = ref({})
  const loaded = ref(false)

  async function fetchUnreadCounts() {
    try {
      const res = await checkUnread()
      unreadCounts.value = res.data || {}
      loaded.value = true
    } catch { /* ignore */ }
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
