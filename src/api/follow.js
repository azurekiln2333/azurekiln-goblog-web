import request from '@/utils/request'

export const followUser = (data) => request.post('/follow', data)

export const unfollowUser = (data) => request.delete('/follow', { data })

export const getFollowList = (params) => request.get('/follow/list', { params })

export const getFollowerList = (params) => request.get('/follower/list', { params })

export const getFriendList = (params) => request.get('/follow/friend', { params })
