import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  const uiStore = useUiStore()
  if (config.showLoading !== false) {
    uiStore.startLoading()
  }
  if (userStore.accessToken) {
    config.headers.token = userStore.accessToken
  }
  if (userStore.refreshToken) {
    config.headers.Authorization = `Bearer ${userStore.refreshToken}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const uiStore = useUiStore()
    if (response.config?.showLoading !== false) {
      uiStore.stopLoading()
    }
    const data = response.data
    if (data.code === 200) {
      const method = response.config?.method?.toUpperCase()
      if (response.config?.successMessage) {
        uiStore.notify(response.config.successMessage, 'success')
      } else if (method && method !== 'GET' && response.config?.silentSuccess !== true) {
        uiStore.notify(data.message || '操作成功', 'success')
      }
      return data
    }
    const message = data.message || '请求失败'
    uiStore.notify(message, 'error')
    return Promise.reject(new Error(message))
  },
  async (error) => {
    const uiStore = useUiStore()
    const originalRequest = error.config
    if (originalRequest?.showLoading !== false) {
      uiStore.stopLoading()
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const userStore = useUserStore()
      if (userStore.refreshToken) {
        try {
          const newToken = await userStore.refreshAccessToken()
          originalRequest.headers.token = newToken
          return request(originalRequest)
        } catch {
          userStore.logout()
          window.location.href = '/login'
        }
      }
    }
    const message = error.response?.data?.message || error.message || '网络异常，请稍后重试'
    uiStore.notify(message, 'error')
    return Promise.reject(error)
  }
)

export default request
