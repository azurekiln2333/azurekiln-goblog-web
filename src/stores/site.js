import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSiteConfig } from '@/api/site'

export const useSiteStore = defineStore('site', () => {
  const siteConfig = ref(null)
  const loaded = ref(false)

  async function loadSiteConfig() {
    if (loaded.value) return
    try {
      const res = await getSiteConfig('site')
      siteConfig.value = res.data
      loaded.value = true
    } catch { /* ignore */ }
  }

  function getSiteName() {
    return siteConfig.value?.name || 'GoBlog'
  }

  return {
    siteConfig,
    loaded,
    loadSiteConfig,
    getSiteName
  }
})
