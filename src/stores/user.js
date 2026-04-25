import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, registerByEmail as registerApi, getUserDetail, logout as logoutApi, refreshToken as refreshTokenApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!accessToken.value)
  const isAdmin = computed(() => userInfo.value?.role === 1)

  async function login(formData) {
    const res = await loginApi(formData)
    accessToken.value = res.data.AccessToken
    refreshToken.value = res.data.RefreshToken
    localStorage.setItem('accessToken', res.data.AccessToken)
    localStorage.setItem('refreshToken', res.data.RefreshToken)
    await fetchUserInfo()
  }

  async function register(formData) {
    const res = await registerApi(formData)
    accessToken.value = res.data.AccessToken
    refreshToken.value = res.data.RefreshToken
    localStorage.setItem('accessToken', res.data.AccessToken)
    localStorage.setItem('refreshToken', res.data.RefreshToken)
    await fetchUserInfo()
  }

  async function fetchUserInfo() {
    if (!accessToken.value) return
    try {
      const res = await getUserDetail()
      userInfo.value = res.data
    } catch {
      userInfo.value = null
    }
  }

  async function refreshAccessToken() {
    const res = await refreshTokenApi()
    accessToken.value = res.data
    localStorage.setItem('accessToken', res.data)
    return res.data
  }

  async function logout() {
    try {
      await logoutApi()
    } catch { /* ignore */ }
    accessToken.value = ''
    refreshToken.value = ''
    userInfo.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  function init() {
    if (accessToken.value) {
      fetchUserInfo()
    }
  }

  return {
    accessToken,
    refreshToken,
    userInfo,
    isLoggedIn,
    isAdmin,
    login,
    register,
    fetchUserInfo,
    refreshAccessToken,
    logout,
    init
  }
})
