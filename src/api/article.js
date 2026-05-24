import request from '@/utils/request'

export const getArticleList = (params) => request.get('/article', { params })

export const getArticleDetail = (id) => request.get(`/article/${id}`)

export const createArticle = (data) => request.post('/article', data)

export const updateArticle = (data) => request.put('/article', data)

export const deleteArticle = (data) => request.delete('/article', { data })

export const adminDeleteArticle = (data) => request.delete('/article/admin', { data })

export const searchArticle = (params) => request.get('/article/search', { params })

export const topArticle = (id, data) => request.post(`/article/top/${id}`, data)

export const cancelTopArticle = (data) => request.delete('/article/top', { data })

export const adminCancelTop = (data) => request.delete('/article/admingTop', { data })

export const getReviewList = (params) => request.get('/article/review', { params })

export const reviewArticle = (id, data) => request.post(`/article/review/${id}`, data)

export const recordArticleView = (data) => request.post('/article/look', data)

export const diggArticle = (id) => request.post(`/article/digg/${id}`)

export const getArticleHistory = (params) => request.get('/article/history', { params })

export const deleteArticleHistory = (data) => request.delete('/article/history', { data })

export const createOrUpdateCategory = (data) => request.post('/article/category', data)

export const getCategoryList = (params) => request.get('/article/category', { params })

export const deleteCategory = (data) => request.delete('/article/category', { data })

export const collectArticle = (data) => request.post('/article/collect', data)

export const getCollectFolders = (params) => request.get('/article/collect/folder', { params })

export const getCollectArticles = (params) => request.get('/article/collect/list', { params })

export const createCollectFolder = (data) => request.post('/article/collect/folder', data)

export const updateCollectFolder = (data) => request.put('/article/collect/folder', data)

export const deleteCollectFolder = (data) => request.delete('/article/collect/folder', { data })
