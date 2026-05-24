import request from '@/utils/request'

export const getFriendLinks = () => request.get('/friendLink')

export const createFriendLink = (data) => request.post('/friendLink', data)

export const deleteFriendLink = (data) => request.delete('/friendLink', { data })

export const updateFriendLink = (id, data) => request.put(`/friendLink/${id}`, data)

export const getFriendPromotions = () => request.get('/friendPromotion')

export const createFriendPromotion = (data) => request.post('/friendPromotion', data)

export const deleteFriendPromotion = (data) => request.delete('/friendPromotion', { data })

export const updateFriendPromotion = (id, data) => request.put(`/friendPromotion/${id}`, data)
