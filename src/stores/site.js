import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSiteConfig } from '@/api/site'
import { useUiStore } from '@/stores/ui'

export const useSiteStore = defineStore('site', () => {
  const siteConfig = ref(null)
  const loaded = ref(false)

  async function loadSiteConfig() {
    if (loaded.value) return
    const uiStore = useUiStore()
    try {
      const res = await getSiteConfig('site')
      siteConfig.value = res.data
      loaded.value = true
    } catch (e) {
      uiStore.notify(e.message || '站点配置加载失败', 'error')
    }
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
