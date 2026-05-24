<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">用户管理</h2>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">用户名</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">昵称</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">角色</th>
            <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="loading">
            <td colspan="4" class="px-6 py-12 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载用户中</p>
            </td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ user.username }}</td>
            <td class="px-6 py-4 text-slate-500">{{ user.nickName || '-' }}</td>
            <td class="px-6 py-4">
              <select
                v-model.number="draftRoles[user.id]"
                class="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
                :class="roleClass(draftRoles[user.id])"
              >
                <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
              </select>
            </td>
            <td class="px-6 py-4">
              <button
                class="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="savingUserId === user.id || draftRoles[user.id] === user.role"
                @click="saveUserRole(user)"
              >
                <span v-if="savingUserId === user.id" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ savingUserId === user.id ? '保存中' : '保存' }}
              </button>
            </td>
          </tr>
          <tr v-if="!loading && users.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-sm text-slate-400">暂无用户</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminUpdateUser, adminGetUserList } from '@/api/user'

const users = ref([])
const loading = ref(false)
const savingUserId = ref(null)
const errorMsg = ref('')
const draftRoles = ref({})

const roles = [
  { value: 1, label: '管理员' },
  { value: 2, label: '超级会员' },
  { value: 3, label: '会员' },
  { value: 4, label: '普通用户' },
  { value: 5, label: '访客' },
  { value: 6, label: '封禁用户' }
]

function roleText(role) {
  const map = { 1: '管理员', 2: '超级会员', 3: '会员', 4: '普通用户', 5: '访客', 6: '封禁用户' }
  return map[role] || '未知'
}

function roleClass(role) {
  const map = { 1: 'bg-blue-50 text-blue-700', 2: 'bg-purple-50 text-purple-700', 4: 'bg-slate-100 text-slate-600', 6: 'bg-red-50 text-red-700' }
  return map[role] || 'bg-slate-100 text-slate-600'
}

async function fetchUsers() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await adminGetUserList({ page: 1, limit: 50 })
    users.value = res.data?.list || res.data || []
    draftRoles.value = Object.fromEntries(users.value.map(user => [user.id, user.role]))
  } catch (e) {
    errorMsg.value = e.message || '获取用户列表失败'
  } finally {
    loading.value = false
  }
}

async function saveUserRole(user) {
  const role = Number(draftRoles.value[user.id])
  if (!role || role === user.role) return

  savingUserId.value = user.id
  errorMsg.value = ''
  try {
    await adminUpdateUser({ userID: user.id, role })
    await fetchUsers()
  } catch (e) {
    errorMsg.value = e.message || '修改用户角色失败'
  } finally {
    savingUserId.value = null
  }
}

onMounted(fetchUsers)
</script>
