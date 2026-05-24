import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use((config) => {
  const userStore = useUserStore()
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
    const data = response.data
    if (data.code === 200) {
      return data
    }
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  async (error) => {
    const originalRequest = error.config
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
    return Promise.reject(error)
  }
)

export default request
