import request from '@/utils/request'

export const login = (data) => request.post('/user/login', data)

export const registerByEmail = (data) => request.post('/user/email', data)

export const getUserDetail = () => request.get('/user/detail')

export const getUserInfo = (id) => request.get(`/user/info/${id}`)

export const updateProfile = (data) => request.put('/user/update', data)

export const adminUpdateUser = (data) => request.put('/user/admin/update', data)

export const adminGetUserList = (params) => request.get('/user/admin/list', { params })

export const refreshToken = () => request.post('/user/token')

export const logout = (data) => request.delete('/user/logout', { data })

export const sendEmailCode = (data) => request.post('/user/send_email', data)

export const resetEmail = (data) => request.put('/user/resetEmail', data)

export const getLoginLog = (params) => request.get('/user/loginlog', { params })

export const updatePassword = (data) => request.put('/user/update_password', data)
