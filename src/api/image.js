import request from '@/utils/request'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getImageList = (params) => request.get('/images', { params })

export const deleteImages = (data) => request.delete('/image', { data })

export const getImageUrl = (id) => `/api/image?id=${id}`
