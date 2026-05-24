<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-6">
    <div class="w-full max-w-md">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-primary font-headline tracking-tighter">GoBlog</h1>
        <p class="text-sm text-slate-500 mt-2">登录您的账户</p>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">登录方式</label>
            <div class="flex gap-2 mt-2">
              <button
                type="button"
                class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors"
                :class="loginType === '用户名' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'"
                @click="loginType = '用户名'"
              >
                用户名
              </button>
              <button
                type="button"
                class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors"
                :class="loginType === '邮箱' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'"
                @click="loginType = '邮箱'"
              >
                邮箱
              </button>
            </div>
          </div>

          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{{ loginType }}</label>
            <input
              v-model="form.val"
              :placeholder="loginType === '用户名' ? '请输入用户名' : '请输入邮箱'"
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">密码</label>
            <input
              v-model="form.pwd"
              type="password"
              placeholder="请输入密码"
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div v-if="captchaData">
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">验证码</label>
            <div class="flex gap-3 mt-1">
              <input
                v-model="form.captchaCode"
                placeholder="请输入验证码"
                class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:ring-2 focus:outline-none"
                required
              />
              <img
                :src="captchaData.captcha"
                alt="验证码"
                class="h-12 rounded-lg cursor-pointer border border-slate-200"
                @click="fetchCaptcha"
                title="点击刷新"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="text-red-500 text-xs font-medium">{{ errorMsg }}</div>

          <button
            type="submit"
            class="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="my-6 flex items-center gap-3">
          <div class="h-px flex-1 bg-slate-100"></div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">其他方式</span>
          <div class="h-px flex-1 bg-slate-100"></div>
        </div>

        <button
          type="button"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-blue-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="qqLoading"
          @click="handleQQLogin"
        >
          <span v-if="qqLoading" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
          <span v-else class="material-symbols-outlined text-base">account_circle</span>
          {{ qqLoading ? '正在获取授权地址...' : '使用 QQ 登录' }}
        </button>

        <div class="mt-6 text-center">
          <router-link to="/register" class="text-sm text-primary hover:underline">还没有账户？立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/api/captcha'
import { getQQLoginUrl } from '@/api/site'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginType = ref('用户名')
const form = ref({ val: '', pwd: '', captchaID: '', captchaCode: '' })
const captchaData = ref(null)
const loading = ref(false)
const qqLoading = ref(false)
const errorMsg = ref('')

async function fetchCaptcha() {
  errorMsg.value = ''
  try {
    const res = await getCaptcha(loginType.value)
    captchaData.value = res.data
    form.value.captchaID = res.data.captchaID
  } catch (e) {
    errorMsg.value = e.message || '验证码加载失败'
  }
}

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    await userStore.login({
      type: loginType.value,
      val: form.value.val,
      pwd: form.value.pwd,
      captchaID: form.value.captchaID,
      captchaCode: form.value.captchaCode
    })
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    errorMsg.value = e.message || '登录失败'
    await fetchCaptcha()
    if (!errorMsg.value) {
      errorMsg.value = e.message || '登录失败'
    }
  }
  loading.value = false
}

async function handleQQLogin() {
  qqLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getQQLoginUrl()
    const url = res.data
    if (!url) {
      errorMsg.value = 'QQ 登录未返回授权地址'
      return
    }
    window.location.href = url
  } catch (e) {
    errorMsg.value = e.message || 'QQ 登录授权地址获取失败'
  } finally {
    qqLoading.value = false
  }
}

onMounted(fetchCaptcha)
</script>
