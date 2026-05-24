<template>
  <div class="p-8">
    <header class="mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">站点设置</h2>
    </header>

    <div class="space-y-8 max-w-3xl">
      <div v-for="configKey in configKeys" :key="configKey" class="bg-white p-6 rounded-2xl border border-slate-100">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h3 class="font-bold text-lg">{{ configKeyLabel(configKey) }}</h3>
          <span class="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">只读</span>
        </div>
        <div class="space-y-4">
          <div v-for="(value, key) in configs[configKey]" :key="key" class="space-y-1">
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{{ key }}</label>
            <input
              v-if="typeof value === 'string' || typeof value === 'number'"
              v-model="configs[configKey][key]"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              readonly
            />
            <input
              v-else-if="typeof value === 'boolean'"
              type="checkbox"
              v-model="configs[configKey][key]"
              class="mt-1"
              disabled
            />
          </div>
        </div>
        <div class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-800">
          New 后端当前只暴露了配置读取接口，保存配置的路由未注册；这里保持只读，避免提交无效请求。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getSiteConfig } from '@/api/site'

const configKeys = ['site', 'email', 'qq', 'ai']
const configs = reactive({})

function configKeyLabel(key) {
  const map = { site: '站点信息', email: '邮件配置', qq: 'QQ 登录', ai: 'AI 配置' }
  return map[key] || key
}

async function loadConfigs() {
  for (const key of configKeys) {
    try {
      const res = await getSiteConfig(key)
      configs[key] = res.data || {}
    } catch { /* ignore */ }
  }
}

onMounted(loadConfigs)
</script>
