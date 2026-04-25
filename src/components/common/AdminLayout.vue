<template>
  <div class="flex min-h-screen">
    <aside class="h-screen w-64 bg-slate-50 border-r border-slate-200 flex flex-col py-6 sticky top-0 shrink-0">
      <div class="px-6 mb-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-white">architecture</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-blue-900 leading-tight">管理后台</h1>
            <p class="text-[10px] uppercase tracking-widest text-slate-500 font-label">系统概览</p>
          </div>
        </div>
      </div>
      <div class="px-4 mb-6">
        <router-link
          to="/user/editor"
          class="w-full bg-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          <span class="text-sm">发布新文章</span>
        </router-link>
      </div>
      <nav class="flex-1 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="px-4 py-3 flex items-center gap-3 group transition-transform duration-300"
          :class="isActive(item.path) ? 'bg-blue-50 text-primary border-r-4 border-primary font-semibold' : 'text-slate-500 hover:translate-x-1 hover:text-primary'"
        >
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span class="text-[10px] uppercase tracking-widest font-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="px-4 mt-auto">
        <div v-if="userStore.userInfo" class="flex items-center gap-3 p-3 mb-4 rounded-xl bg-slate-100">
          <img
            v-if="userStore.userInfo.avatar"
            :src="userStore.userInfo.avatar"
            alt="管理员头像"
            class="w-8 h-8 rounded-full border border-slate-200"
          />
          <div class="overflow-hidden">
            <p class="text-xs font-bold truncate text-slate-900">{{ userStore.userInfo.nickName || userStore.userInfo.username }}</p>
            <p class="text-[9px] text-slate-500 uppercase">超级管理员</p>
          </div>
        </div>
        <button
          class="text-slate-500 px-4 py-3 flex items-center gap-3 hover:text-red-600 transition-colors w-full"
          @click="handleLogout"
        >
          <span class="material-symbols-outlined">logout</span>
          <span class="text-[10px] uppercase tracking-widest font-label">退出登录</span>
        </button>
      </div>
    </aside>
    <main class="flex-1 min-w-0 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { path: '/admin', icon: 'dashboard', label: '仪表盘' },
  { path: '/admin/articles', icon: 'list_alt', label: '文章管理' },
  { path: '/admin/users', icon: 'group', label: '用户管理' },
  { path: '/admin/images', icon: 'image', label: '媒体库' },
  { path: '/admin/banners', icon: 'view_carousel', label: '轮播图' },
  { path: '/admin/friend-links', icon: 'link', label: '友链管理' },
  { path: '/admin/logs', icon: 'list_alt', label: '日志监控' },
  { path: '/admin/settings', icon: 'settings', label: '站点设置' }
]

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>
