import request from '@/utils/request'

export const getCaptcha = (target) => request.get('/captcha', { params: { target } })
