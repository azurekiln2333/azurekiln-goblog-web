import request from '@/utils/request'

export const getCommentList = (params) => request.get('/comment', { params })

export const getChildComments = (params) => request.get('/commentChild', { params })

export const postComment = (data) => request.post('/comment', data)

export const deleteComment = (id) => request.delete(`/comment/${id}`)

export const diggComment = (id) => request.post(`/comment/digg/${id}`)
