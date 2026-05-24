<template>
  <header class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl transition-all duration-300 border-b border-blue-100">
    <nav class="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
      <router-link to="/" class="text-xl font-extrabold tracking-tighter text-blue-800">
        {{ siteName }}
      </router-link>
      <div class="hidden md:flex items-center gap-8">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="text-sm tracking-tight transition-all duration-300"
          :class="isActive(item.path) ? 'text-blue-700 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600 hover:text-blue-600'"
        >
          {{ item.label }}
        </router-link>
      </div>
      <div class="flex items-center gap-4">
        <button
          v-if="userStore.isLoggedIn"
          class="material-symbols-outlined text-slate-600 p-2 hover:bg-blue-50 rounded-full transition-all relative"
          @click="$router.push('/user/messages')"
        >
          notifications
          <span
            v-if="totalUnread > 0"
            class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
          >{{ totalUnread > 9 ? '9+' : totalUnread }}</span>
        </button>
        <template v-if="userStore.isLoggedIn">
          <router-link to="/user/center" class="flex items-center gap-2">
            <img
              v-if="userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              alt="avatar"
              class="w-8 h-8 rounded-full object-cover border border-blue-200"
            />
            <span v-else class="material-symbols-outlined text-slate-600 p-2 hover:bg-blue-50 rounded-full transition-all">account_circle</span>
          </router-link>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            登录
          </router-link>
        </template>
        <button class="md:hidden material-symbols-outlined text-slate-600 p-2" @click="mobileMenuOpen = !mobileMenuOpen">
          menu
        </button>
      </div>
    </nav>
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-blue-100 bg-white/95 backdrop-blur-xl">
      <div class="flex flex-col py-2 px-6 gap-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="py-2 text-sm"
          :class="isActive(item.path) ? 'text-blue-700 font-bold' : 'text-slate-600'"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSiteStore } from '@/stores/site'
import { useMessageStore } from '@/stores/message'

const route = useRoute()
const userStore = useUserStore()
const siteStore = useSiteStore()
const messageStore = useMessageStore()
const mobileMenuOpen = ref(false)

const siteName = computed(() => siteStore.getSiteName())
const totalUnread = computed(() => messageStore.getTotalUnread())

const navItems = computed(() => {
  const items = [
    { path: '/', label: '首页' },
    { path: '/search', label: '搜索' }
  ]
  if (userStore.isLoggedIn) {
    items.push({ path: '/user/center', label: '消息' })
  }
  if (userStore.isAdmin) {
    items.push({ path: '/admin', label: '管理' })
  }
  return items
})

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

onMounted(() => {
  siteStore.loadSiteConfig()
  if (userStore.isLoggedIn) {
    messageStore.fetchUnreadCounts()
  }
})
</script>
