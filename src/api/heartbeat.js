import request from '@/utils/request'

export const getHeartbeat = () => request.get('/heartbeat', { showLoading: false })
