<template>
  <div class="p-8">
    <header class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">用户管理</h2>
    </header>
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
          <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ user.username }}</td>
            <td class="px-6 py-4 text-slate-500">{{ user.nickName || '-' }}</td>
            <td class="px-6 py-4">
              <span class="text-[10px] font-bold px-2 py-1 rounded-full" :class="roleClass(user.role)">{{ roleText(user.role) }}</span>
            </td>
            <td class="px-6 py-4">
              <button class="text-[10px] font-bold text-primary hover:underline" @click="editUser(user)">编辑</button>
            </td>
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
  try {
    const res = await adminGetUserList({ page: 1, limit: 50 })
    users.value = res.data || []
  } catch (e) {
    console.error('获取用户列表失败', e)
  }
  loading.value = false
}

async function editUser(user) {
  const newRole = prompt(`修改 ${user.nickName || user.username} 的角色 (1-6):`, user.role)
  if (newRole) {
    try {
      await adminUpdateUser({ userID: user.id, role: Number(newRole) })
      fetchUsers()
    } catch (e) {
      alert('修改失败: ' + e.message)
    }
  }
}

onMounted(fetchUsers)
</script>
