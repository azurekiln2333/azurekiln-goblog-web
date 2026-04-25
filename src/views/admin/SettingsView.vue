<template>
  <div class="p-8">
    <header class="mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">站点设置</h2>
    </header>

    <div class="space-y-8 max-w-3xl">
      <div v-for="configKey in configKeys" :key="configKey" class="bg-white p-6 rounded-2xl border border-slate-100">
        <h3 class="font-bold text-lg mb-4">{{ configKeyLabel(configKey) }}</h3>
        <div class="space-y-4">
          <div v-for="(value, key) in configs[configKey]" :key="key" class="space-y-1">
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{{ key }}</label>
            <input
              v-if="typeof value === 'string' || typeof value === 'number'"
              v-model="configs[configKey][key]"
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:ring-2"
            />
            <input
              v-else-if="typeof value === 'boolean'"
              type="checkbox"
              v-model="configs[configKey][key]"
              class="mt-1"
            />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button class="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity" @click="saveConfig(configKey)">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSiteConfig, updateSiteConfig } from '@/api/site'

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

async function saveConfig(key) {
  try {
    await updateSiteConfig(key, configs[key])
    alert('保存成功')
  } catch { /* ignore */ }
}

onMounted(loadConfigs)
</script>
