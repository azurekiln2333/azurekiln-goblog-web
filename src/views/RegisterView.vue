<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-6">
    <div class="w-full max-w-md">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-primary font-headline tracking-tighter">GoBlog</h1>
        <p class="text-sm text-slate-500 mt-2">创建新账户</p>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">昵称</label>
            <input
              v-model="form.nickName"
              placeholder="请输入昵称"
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">图形验证码</label>
            <div class="flex gap-3 mt-1">
              <input
                v-model="form.captchaCode"
                placeholder="请输入验证码"
                class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:ring-2 focus:outline-none"
                required
              />
              <img
                v-if="captchaData"
                :src="captchaData.captcha"
                alt="验证码"
                class="h-12 rounded-lg cursor-pointer border border-slate-200"
                @click="fetchCaptcha"
                title="点击刷新"
              />
            </div>
          </div>

          <div>
            <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">邮箱验证码</label>
            <div class="flex gap-3 mt-1">
              <input
                v-model="form.emailCode"
                placeholder="请输入邮箱验证码"
                class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:ring-2 focus:outline-none"
                required
              />
              <button
                type="button"
                class="px-4 py-3 bg-blue-50 text-primary text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap"
                :disabled="countdown > 0"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </button>
            </div>
          </div>

          <div v-if="errorMsg" class="text-red-500 text-xs font-medium">{{ errorMsg }}</div>

          <button
            type="submit"
            class="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            :disabled="loading"
          >
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm text-primary hover:underline">已有账户？立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/api/captcha'
import { sendEmailCode } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  email: '',
  nickName: '',
  password: '',
  captchaID: '',
  captchaCode: '',
  emailID: '',
  emailCode: ''
})
const captchaData = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const countdown = ref(0)

async function fetchCaptcha() {
  errorMsg.value = ''
  try {
    const res = await getCaptcha('注册')
    captchaData.value = res.data
    form.value.captchaID = res.data.captchaID
  } catch (e) {
    errorMsg.value = e.message || '验证码加载失败'
  }
}

async function sendCode() {
  if (!form.value.email || !form.value.captchaCode) {
    errorMsg.value = '请先填写邮箱和图形验证码'
    return
  }
  try {
    const res = await sendEmailCode({
      type: '注册',
      email: form.value.email,
      captchaID: form.value.captchaID,
      captchaCode: form.value.captchaCode
    })
    form.value.emailID = res.data?.emailID || res.data
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    errorMsg.value = e.message || '发送失败'
    await fetchCaptcha()
    if (!errorMsg.value) {
      errorMsg.value = e.message || '发送失败'
    }
  }
}

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''
  try {
    await userStore.register({
      emailID: form.value.emailID,
      emailCode: form.value.emailCode,
      password: form.value.password,
      nickName: form.value.nickName
    })
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message || '注册失败'
  }
  loading.value = false
}

onMounted(fetchCaptcha)
</script>
