import request from '@/utils/request'

export const getSiteConfig = (name) => request.get(`/site/${name}`)

export const getQQLoginUrl = () => request.get('/site/qq_login')
