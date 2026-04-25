<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">系统日志</h2>
      <div class="flex gap-3">
        <select v-model="logType" class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm" @change="fetchLogs">
          <option value="">全部类型</option>
          <option value="1">登录日志</option>
          <option value="2">操作日志</option>
          <option value="3">错误日志</option>
        </select>
        <button v-if="selectedIds.length > 0" class="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl" @click="deleteSelected">删除选中</button>
      </div>
    </header>

    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-4 py-3 text-left"><input type="checkbox" @change="toggleAll" /></th>
            <th class="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">ID</th>
            <th class="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">类型</th>
            <th class="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">内容</th>
            <th class="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">IP</th>
            <th class="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3"><input type="checkbox" v-model="selectedIds" :value="log.id" /></td>
            <td class="px-4 py-3 text-slate-500">{{ log.id }}</td>
            <td class="px-4 py-3"><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{{ log.logType || '-' }}</span></td>
            <td class="px-4 py-3 text-slate-700 max-w-xs truncate">{{ log.content || log.serviceName || '-' }}</td>
            <td class="px-4 py-3 text-slate-500">{{ log.ip || '-' }}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ formatDate(log.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogList, deleteLogs } from '@/api/log'

const logs = ref([])
const logType = ref('')
const selectedIds = ref([])

async function fetchLogs() {
  try {
    const params = { page: 1, limit: 50 }
    if (logType.value) params.logType = Number(logType.value)
    const res = await getLogList(params)
    logs.value = res.data?.list || []
  } catch { /* ignore */ }
}

function toggleAll(e) {
  if (e.target.checked) {
    selectedIds.value = logs.value.map(l => l.id)
  } else {
    selectedIds.value = []
  }
}

async function deleteSelected() {
  if (selectedIds.value.length === 0) return
  if (!confirm('确认删除？')) return
  try {
    await deleteLogs({ IDList: selectedIds.value })
    selectedIds.value = []
    fetchLogs()
  } catch { /* ignore */ }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(fetchLogs)
</script>
