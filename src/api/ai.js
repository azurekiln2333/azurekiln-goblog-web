import request from '@/utils/request'

export const chatWithAI = (data) => request.post('/chat', data)
