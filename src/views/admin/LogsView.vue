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
        <button
          v-if="selectedIds.length > 0"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="deleting"
          @click="deleteSelected"
        >
          <span v-if="deleting" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          {{ deleting ? '删除中...' : '删除选中' }}
        </button>
      </div>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

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
            <th class="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="loading">
            <td colspan="7" class="px-6 py-12 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载日志中</p>
            </td>
          </tr>
          <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3"><input type="checkbox" v-model="selectedIds" :value="log.id" /></td>
            <td class="px-4 py-3 text-slate-500">{{ log.id }}</td>
            <td class="px-4 py-3"><span class="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{{ log.logType || '-' }}</span></td>
            <td class="px-4 py-3 text-slate-700 max-w-xs truncate">{{ log.content || log.serviceName || '-' }}</td>
            <td class="px-4 py-3 text-slate-500">{{ log.ip || '-' }}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ formatDate(log.createdAt) }}</td>
            <td class="px-4 py-3">
              <button
                class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50"
                :disabled="readingId === log.id"
                @click="openLogDetail(log)"
              >
                <span v-if="readingId === log.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                详情
              </button>
            </td>
          </tr>
          <tr v-if="!loading && logs.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-sm text-slate-400">暂无日志</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="detailLog" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
        <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 class="text-lg font-extrabold text-blue-900">{{ detailLog.title || '日志详情' }}</h3>
            <p class="mt-1 text-xs text-slate-500">ID {{ detailLog.id }} · {{ formatDate(detailLog.createdAt) }}</p>
          </div>
          <button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" @click="closeDetail">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-5 px-6 py-5">
          <div v-if="detailError" class="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {{ detailError }}
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="rounded-xl bg-slate-50 px-4 py-3">
              <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">类型</p>
              <p class="mt-1 text-sm font-semibold text-slate-800">{{ logTypeText(detailLog.logType) }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 px-4 py-3">
              <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">级别</p>
              <p class="mt-1 text-sm font-semibold" :class="levelClass(detailLog.level)">{{ logLevelText(detailLog.level) }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 px-4 py-3">
              <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">状态</p>
              <p class="mt-1 text-sm font-semibold" :class="detailLog.isRead ? 'text-green-700' : 'text-yellow-700'">
                {{ detailLog.isRead ? '已读' : '未读' }}
              </p>
            </div>
          </div>

          <dl class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">服务</dt>
              <dd class="mt-1 text-slate-700">{{ detailLog.serviceName || '-' }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">用户</dt>
              <dd class="mt-1 text-slate-700">{{ detailLog.userNickName || detailLog.userID || '-' }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">IP</dt>
              <dd class="mt-1 text-slate-700">{{ detailLog.ip || '-' }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">地址</dt>
              <dd class="mt-1 text-slate-700">{{ detailLog.addr || '-' }}</dd>
            </div>
          </dl>

          <div>
            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">内容</p>
            <pre class="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{{ detailLog.content || '无内容' }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogList, readLog, deleteLogs } from '@/api/log'

const logs = ref([])
const logType = ref('')
const selectedIds = ref([])
const loading = ref(false)
const deleting = ref(false)
const readingId = ref(null)
const detailLog = ref(null)
const detailError = ref('')
const errorMsg = ref('')

async function fetchLogs() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = { page: 1, limit: 50 }
    if (logType.value) params.logType = Number(logType.value)
    const res = await getLogList(params)
    logs.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '日志加载失败'
  } finally {
    loading.value = false
  }
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
  deleting.value = true
  errorMsg.value = ''
  try {
    await deleteLogs({ IDList: selectedIds.value })
    selectedIds.value = []
    await fetchLogs()
  } catch (e) {
    errorMsg.value = e.message || '日志删除失败'
  } finally {
    deleting.value = false
  }
}

async function openLogDetail(log) {
  detailLog.value = { ...log }
  detailError.value = ''
  readingId.value = log.id
  try {
    await readLog(log.id)
    log.isRead = true
    detailLog.value = { ...log }
  } catch (e) {
    detailError.value = e.message || '日志读取状态更新失败'
  } finally {
    readingId.value = null
  }
}

function closeDetail() {
  detailLog.value = null
  detailError.value = ''
}

function logTypeText(type) {
  const map = { 1: '登录日志', 2: '操作日志', 3: '运行时日志' }
  return map[type] || type || '-'
}

function logLevelText(level) {
  const map = { 1: '信息', 2: '警告', 3: '错误' }
  return map[level] || level || '-'
}

function levelClass(level) {
  const map = { 1: 'text-blue-700', 2: 'text-yellow-700', 3: 'text-red-700' }
  return map[level] || 'text-slate-700'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(fetchLogs)
</script>
