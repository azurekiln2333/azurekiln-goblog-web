import request from '@/utils/request'

export const getLogList = (params) => request.get('/logs', { params })

export const readLog = (id) => request.get(`/logs/${id}`)

export const deleteLogs = (data) => request.delete('/logs', { data })
