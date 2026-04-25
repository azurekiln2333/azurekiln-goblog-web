import request from '@/utils/request'

export const getBannerList = () => request.get('/banner')

export const createBanner = (data) => request.post('/banner', data)

export const deleteBanner = (data) => request.delete('/banner', { data })

export const updateBanner = (id, data) => request.put(`/banner/${id}`, data)
