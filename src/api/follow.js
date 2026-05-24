import request from '@/utils/request'

export const followUser = (data) => request.post('/user/follow', data)

export const unfollowUser = (data) => request.post('/user/follow/unfollow', data)

export const getFollowList = (params) => request.get('/user/follow/list', { params })

export const getFollowerList = (params) => request.get('/user/follower/list', { params })

export const checkFriend = (params) => request.get('/user/friend/check', { params })
