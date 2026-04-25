import request from '@/utils/request'

export const sendChat = (data) => request.post('/chat/send', data)

export const getChatHistory = (params) => request.get('/chat/get', { params })

export const getChatSessions = (params) => request.get('/chat/session', { params })
