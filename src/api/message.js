import request from '@/utils/request'

export const getMessageConf = () => request.get('/msg/conf')

export const updateMessageConf = (data) => request.post('/msg/conf/update', data)

export const checkUnread = () => request.get('/msg/check')

export const clearMessages = (data) => request.post('/msg/clear', data)

export const getMessageList = (params) => request.get('/msg', { params })

export const deleteMessages = (data) => request.delete('/msg', { data })
