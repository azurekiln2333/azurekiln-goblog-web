<template>
  <div>
    <header class="bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-8 py-4 flex justify-between items-center border-b border-slate-100">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">仪表盘</h2>
      <div class="flex items-center gap-6">
        <div class="relative group">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
          <input class="pl-10 pr-4 py-2 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl text-sm w-64 focus:ring-primary focus:ring-2 transition-all" placeholder="搜索系统资源..." type="text" />
        </div>
      </div>
    </header>
    <div class="p-8 space-y-12 max-w-7xl mx-auto">
      <section>
        <div class="flex justify-between items-end mb-6">
          <div>
            <h3 class="text-2xl font-bold tracking-tight text-slate-900">概览指标</h3>
            <p class="text-sm text-slate-500">实时互动数据与系统健康状态。</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="md:col-span-2 bg-blue-50 p-8 rounded-3xl relative overflow-hidden group border border-blue-100">
            <div class="relative z-10">
              <span class="material-symbols-outlined text-primary mb-4 p-3 bg-white rounded-2xl inline-block shadow-sm">article</span>
              <h4 class="text-sm font-label uppercase tracking-widest text-slate-600 mb-1">文章总数</h4>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold text-blue-900">{{ stats.articleCount || 0 }}</span>
              </div>
            </div>
          </div>
          <div class="bg-white border border-slate-200 p-8 rounded-3xl">
            <span class="material-symbols-outlined text-primary mb-4 p-3 bg-blue-50 rounded-2xl inline-block">chat_bubble</span>
            <h4 class="text-sm font-label uppercase tracking-widest text-slate-500 mb-1">评论数</h4>
            <p class="text-3xl font-extrabold text-slate-900">{{ stats.commentCount || 0 }}</p>
          </div>
          <div class="bg-white border border-slate-200 p-8 rounded-3xl">
            <span class="material-symbols-outlined text-primary mb-4 p-3 bg-blue-50 rounded-2xl inline-block">group</span>
            <h4 class="text-sm font-label uppercase tracking-widest text-slate-500 mb-1">用户数</h4>
            <p class="text-3xl font-extrabold text-slate-900">{{ stats.userCount || 0 }}</p>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section class="lg:col-span-2 space-y-8">
          <div>
            <h3 class="text-2xl font-bold tracking-tight mb-6 text-slate-900">站点配置</h3>
            <div class="bg-slate-50 p-8 rounded-3xl space-y-6 border border-slate-100">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-label uppercase tracking-widest text-slate-500 px-1">站点名称</label>
                  <input v-model="siteConfig.name" class="w-full bg-white border-none ring-1 ring-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:ring-2" type="text" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-label uppercase tracking-widest text-slate-500 px-1">站点副标题</label>
                  <input v-model="siteConfig.subtitle" class="w-full bg-white border-none ring-1 ring-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:ring-2" type="text" />
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button class="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors" @click="loadSiteConfig">舍弃更改</button>
                <button
                  class="px-6 py-3 text-sm font-bold bg-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                  disabled
                  title="New 后端未注册站点配置更新路由"
                >
                  后端未开放保存
                </button>
              </div>
              <p class="text-xs font-medium text-amber-700">当前后端只暴露站点配置读取接口，保存功能等待后端路由开放后再启用。</p>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-bold tracking-tight text-slate-900">系统日志</h3>
            <button class="text-xs font-bold text-primary px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" @click="fetchLogs">刷新</button>
          </div>
          <div class="bg-slate-50 rounded-3xl p-2 space-y-2 border border-slate-100">
            <div v-for="log in logs" :key="log.id" class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all">
              <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-label font-bold text-primary bg-blue-50 px-2 py-0.5 rounded">ID: {{ log.id }}</span>
                <span class="text-[9px] text-slate-400">{{ timeAgo(log.createdAt) }}</span>
              </div>
              <p class="text-xs font-medium text-slate-700">{{ log.content || log.serviceName }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSiteConfig } from '@/api/site'
import { getLogList } from '@/api/log'
import { getArticleList } from '@/api/article'

const stats = ref({})
const siteConfig = ref({})
const logs = ref([])

async function loadSiteConfig() {
  try {
    const res = await getSiteConfig('site')
    siteConfig.value = res.data || {}
  } catch { /* ignore */ }
}

async function fetchLogs() {
  try {
    const res = await getLogList({ page: 1, limit: 5 })
    logs.value = res.data?.list || []
  } catch { /* ignore */ }
}

async function fetchStats() {
  try {
    const res = await getArticleList({ type: 'admin', page: 1, limit: 1 })
    stats.value.articleCount = res.data?.count || 0
  } catch { /* ignore */ }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  return `${Math.floor(mins / 60)}小时前`
}

onMounted(() => {
  loadSiteConfig()
  fetchLogs()
  fetchStats()
})
</script>
