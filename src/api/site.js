import request from '@/utils/request'

export const getSiteConfig = (name) => request.get(`/site/${name}`)

export const updateSiteConfig = (name, data) => request.put(`/site/${name}`, data)

export const getQQLoginUrl = () => request.get('/site/qq_login')
